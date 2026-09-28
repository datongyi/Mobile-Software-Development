const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createServer,
  normalizeEndpoint,
  resolveConfig,
  validateInput,
  validateReply,
} = require("../server");
const input = {
  tone: "gentle",
  mode: "letter",
  entries: [{ title: "散步", body: "今天看到了落日", date: "2026-09-17" }],
};
const reply = {
  reply: "愿你记住这片落日。",
  title: "落日来信",
  tags: ["散步"],
  color: "#88BB99",
  colorName: "叶绿",
};
async function run(options, fn) {
  const server = createServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
const post = (url, body = input, headers = {}) =>
  fetch(url + "/api/letter", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
test("request rejects invalid mode, excess input and unsafe response color", () => {
  assert.throws(() => validateInput({ ...input, mode: "__proto__" }));
  assert.throws(() =>
    validateInput({
      ...input,
      entries: [{ ...input.entries[0], body: "x".repeat(12001) }],
    }),
  );
  assert.throws(() =>
    validateReply({ ...reply, color: "red;position:absolute" }),
  );
  assert.throws(() => validateReply({ ...reply, reply: "" }));
});
test("missing key is explicit; health never reveals a key", async () => {
  await run({ apiKey: "" }, async (url) => {
    const health = await (await fetch(url + "/health")).json();
    assert.equal(health.configured, false);
    assert.equal(health.providerLabel, "DeepSeek");
    assert.ok(!JSON.stringify(health).includes("test-secret"));
    const r = await post(url);
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /配置不完整/);
  });
});
test("real request contract and validated response using injected upstream", async () => {
  await run(
    {
      apiKey: "test-secret",
      fetchImpl: async (url, options) => {
        assert.equal(url, "https://api.deepseek.com/chat/completions");
        const body = JSON.parse(options.body);
        assert.equal(body.response_format.type, "json_object");
        assert.equal(body.model, "deepseek-flash");
        assert.match(body.messages[0].content, /json/);
        assert.equal(options.headers.Authorization, "Bearer test-secret");
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: JSON.stringify(reply) },
                finish_reason: "stop",
              },
            ],
          }),
        );
      },
    },
    async (url) => {
      const r = await post(url);
      assert.equal(r.status, 200);
      const data = await r.json();
      assert.equal(data.reply, reply.reply);
      assert.equal(data.tone, "gentle");
      assert.ok(!JSON.stringify(data).includes("test-secret"));
    },
  );
});
test("OpenAI-compatible relay uses configured endpoint, model and common request fields", async () => {
  await run(
    {
      provider: "compatible",
      apiKey: "relay-secret",
      baseUrl: "https://relay.example.com/v1",
      model: "gpt-demo",
      fetchImpl: async (url, options) => {
        assert.equal(url, "https://relay.example.com/v1/chat/completions");
        assert.equal(options.headers.Authorization, "Bearer relay-secret");
        const body = JSON.parse(options.body);
        assert.equal(body.model, "gpt-demo");
        assert.equal(body.max_tokens, 4096);
        assert.equal(body.response_format.type, "json_object");
        assert.equal(Object.hasOwn(body, "thinking"), false);
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify(reply) } }],
          }),
        );
      },
    },
    async (url) => {
      const health = await (await fetch(url + "/health")).json();
      assert.equal(health.configured, true);
      assert.equal(health.providerLabel, "GPT 兼容中转");
      assert.equal(health.model, "gpt-demo");
      const response = await post(url);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).provider, "compatible");
    },
  );
});
test("relay compatibility switches can omit JSON mode and use completion token field", async () => {
  await run(
    {
      provider: "openai",
      apiKey: "test",
      model: "gpt-demo",
      jsonMode: false,
      tokenField: "max_completion_tokens",
      fetchImpl: async (url, options) => {
        assert.equal(url, "https://api.openai.com/v1/chat/completions");
        const body = JSON.parse(options.body);
        assert.equal(Object.hasOwn(body, "response_format"), false);
        assert.equal(body.max_completion_tokens, 4096);
        assert.equal(Object.hasOwn(body, "max_tokens"), false);
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify(reply) } }],
          }),
        );
      },
    },
    async (url) => assert.equal((await post(url)).status, 200),
  );
});
test("AI endpoint configuration rejects unsafe or malformed values", () => {
  assert.equal(
    normalizeEndpoint("https://relay.example.com/v1/chat/completions"),
    "https://relay.example.com/v1/chat/completions",
  );
  assert.equal(
    normalizeEndpoint("http://127.0.0.1:9000/v1"),
    "http://127.0.0.1:9000/v1/chat/completions",
  );
  assert.throws(() => normalizeEndpoint("http://relay.example.com/v1"), /HTTPS/);
  assert.throws(
    () => resolveConfig({ provider: "unknown" }),
    /AI_PROVIDER/,
  );
});
test("malformed or truncated model output is rejected", async () => {
  for (const content of ["", '{"reply":"incomplete"}'])
    await run(
      {
        apiKey: "test",
        fetchImpl: async () =>
          new Response(JSON.stringify({ choices: [{ message: { content } }] })),
      },
      async (url) => {
        assert.equal((await post(url)).status, 502);
      },
    );
});
test("upstream credentials and content are not leaked through error messages", async () => {
  await run(
    {
      apiKey: "secret",
      fetchImpl: async () =>
        new Response("private-provider-body", { status: 401 }),
    },
    async (url) => {
      const r = await post(url);
      const body = await r.text();
      assert.equal(r.status, 502);
      assert.ok(!body.includes("private-provider-body"));
      assert.ok(!body.includes("secret"));
    },
  );
});
test("browser origins cannot call the local cost-bearing endpoint", async () => {
  await run(
    {
      apiKey: "test",
      fetchImpl: () => {
        throw Error("must not call");
      },
    },
    async (url) =>
      assert.equal(
        (await post(url, input, { Origin: "https://untrusted.example" }))
          .status,
        403,
      ),
  );
});
test("timeout aborts upstream and frees concurrency slot", async () => {
  let calls = 0;
  await run(
    {
      apiKey: "test",
      timeoutMs: 15,
      maxConcurrent: 1,
      fetchImpl: async (url, options) => {
        calls++;
        return new Promise((resolve, reject) =>
          options.signal.addEventListener("abort", () =>
            reject(new DOMException("timeout", "AbortError")),
          ),
        );
      },
    },
    async (url) => {
      assert.equal((await post(url)).status, 504);
      assert.equal((await post(url)).status, 504);
      assert.equal(calls, 2);
    },
  );
});
test("concurrent request limit rejects a second generation without calling upstream", async () => {
  let release, entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  await run(
    {
      apiKey: "test",
      maxConcurrent: 1,
      fetchImpl: () =>
        new Promise((resolve) => {
          release = () =>
            resolve(
              new Response(
                JSON.stringify({
                  choices: [{ message: { content: JSON.stringify(reply) } }],
                }),
              ),
            );
          entered();
        }),
    },
    async (url) => {
      const first = post(url);
      await started;
      try {
        assert.equal((await post(url)).status, 429);
      } finally {
        release();
      }
      assert.equal((await first).status, 200);
    },
  );
});
test("compatible UI aliases are normalized", () => {
  const result = validateInput({ ...input, tone: "humorous", mode: "reply" });
  assert.equal(result.tone, "humor");
  assert.equal(result.mode, "letter");
});
test("dual mode requires and returns two distinct reply fields", async () => {
  assert.throws(() => validateReply(reply, "dual"), /格式/);
  const dual = { ...reply, alternateReply: "也可以把问题拆成明天的一小步。" };
  await run(
    {
      apiKey: "test",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: JSON.stringify(dual) },
                finish_reason: "stop",
              },
            ],
          }),
        ),
    },
    async (url) => {
      const response = await post(url, { ...input, mode: "dual" });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).alternateReply, dual.alternateReply);
    },
  );
});

function letterHarness() {
  const vm = require("node:vm"),
    fs = require("node:fs");
  let page,
    approve,
    requests = 0,
    lastRequest;
  const { createStore } = require("../miniprogram/lib/store");
  let db;
  const store = createStore({
    get: () => db,
    set: (k, v) => {
      db = v;
    },
  });
  store.create("test");
  const ids = [1, 2].map((i) =>
    store.save({
      title: "标题" + i,
      body: "正文" + i,
      date: "2026-09-17",
      tags: [],
      photos: [],
    }),
  );
  const runtime = {
    store,
    guard: () => true,
    theme: () => "",
    toast: () => {},
    view: (e) => e,
    confirm: () =>
      new Promise((resolve) => {
        approve = resolve;
      }),
  };
  vm.runInNewContext(
    fs.readFileSync(
      require("node:path").join(
        __dirname,
        "../miniprogram/pages/letter/letter.js",
      ),
      "utf8",
    ),
    {
      require: () => runtime,
      Page: (value) => {
        page = value;
      },
      wx: {
        request: (options) => {
          requests++;
          lastRequest = options;
          return { abort() {} };
        },
      },
      Date,
    },
  );
  page.setData = (patch) => Object.assign(page.data, patch);
  page.onLoad({});
  page.onShow();
  page.data.selected = ids;
  page.data.mode = "summary";
  return {
    page,
    store,
    ids,
    approve: () => approve(true),
    requests: () => requests,
    request: () => lastRequest,
  };
}
test("letter confirmation prevents duplicate requests and sends only consented fields", async () => {
  const h = letterHarness();
  const first = h.page.generate();
  await h.page.generate();
  assert.equal(h.requests(), 0);
  h.approve();
  await first;
  assert.equal(h.requests(), 1);
  assert.deepEqual(Object.keys(h.request().data.entries[0]).sort(), [
    "body",
    "date",
    "title",
  ]);
});
test("multi-entry reply persists and a deleted source hides derived history", async () => {
  const h = letterHarness();
  const pending = h.page.generate();
  h.approve();
  await pending;
  h.request().success({ statusCode: 200, data: reply });
  assert.equal(h.store.get(h.ids[0]).replies.length, 1);
  h.page.refreshHistory();
  assert.equal(h.page.data.history.length, 1);
  assert.equal(h.page.data.history[0].toneLabel, "温柔倾听");
  assert.equal(h.page.data.history[0].modeLabel, "阶段回顾");
  h.store.delete(h.ids[1]);
  h.page.refreshHistory();
  assert.equal(h.page.data.history.length, 0);
});
test("account change during confirmation never submits private content", async () => {
  const h = letterHarness();
  const pending = h.page.generate();
  h.store.create("other");
  h.approve();
  await pending;
  assert.equal(h.requests(), 0);
});
test("late model response cannot cross account boundary", async () => {
  const h = letterHarness();
  const owner = h.store.active();
  const pending = h.page.generate();
  h.approve();
  await pending;
  h.store.create("other");
  h.request().success({ statusCode: 200, data: reply });
  h.store.switch(owner);
  assert.equal(h.store.get(h.ids[0]).replies.length, 0);
});
