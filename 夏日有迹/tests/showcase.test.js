const test = require("node:test");
const assert = require("node:assert/strict");
const {
  periodForHour,
  privacyFindings,
  wordCloud,
  graph,
  palette,
  mosaic,
  dataHealth,
} = require("../miniprogram/lib/showcase");

const entries = [
  {
    id: "a",
    title: "海边散步",
    body: "傍晚沿着海边散步，看见晚霞。",
    date: "2026-07-01",
    mood: "晴朗",
    tags: ["海边", "散步"],
    photos: ["/assets/sea.jpg"],
    color: "#F08060",
  },
  {
    id: "b",
    title: "树下散步",
    body: "树影和晚霞落在路上。",
    date: "2026-07-02",
    mood: "平静",
    tags: ["散步", "日常"],
    photos: [],
  },
];

test("one-day periods have stable local boundaries", () => {
  assert.equal(periodForHour(8), "morning");
  assert.equal(periodForHour(14), "afternoon");
  assert.equal(periodForHour(22), "night");
});

test("privacy scan reports categories without returning sensitive values", () => {
  const result = privacyFindings(
    "电话 13800138000，邮箱 me@example.com，住址海风路3号",
  );
  assert.deepEqual(result, ["手机号码", "电子邮箱", "详细地址"]);
  assert.equal(result.join(" ").includes("13800138000"), false);
});

test("showcase derivations use local visible entry data", () => {
  assert.ok(wordCloud(entries).some((item) => item.word === "散步"));
  assert.deepEqual(graph(entries).edges[0].common, ["散步"]);
  assert.equal(palette(entries)[1].source, "本地心情色");
  assert.equal(mosaic(entries).length, 2);
  const health = dataHealth({ entries, settings: { lastBackupAt: 10 } });
  assert.equal(health.photos, 1);
  assert.equal(health.lastBackupAt, 10);
  assert.equal(health.largest.id, "a");
});
