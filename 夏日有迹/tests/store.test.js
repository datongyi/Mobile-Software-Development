const test = require("node:test");
const assert = require("node:assert/strict");
const { createStore, dateKey } = require("../miniprogram/lib/store");
const setup = () =>
  createStore({ get: () => null, set: () => {}, userPath: "/local/" });
const entry = () => ({
  title: "一天",
  body: "散步",
  date: dateKey(),
  tags: ["散步"],
  photos: [],
  mood: "晴朗",
});
test("accounts and drafts remain isolated", () => {
  const s = setup();
  const a = s.create("A");
  s.save(entry());
  s.draft({ body: "draft" });
  s.create("B");
  assert.equal(s.list().length, 0);
  assert.equal(s.account().draft, null);
  s.switch(a.id);
  assert.equal(s.list().length, 1);
  assert.equal(s.account().draft.body, "draft");
});
test("locked capsules cannot enter search, related or AI writes", () => {
  const s = setup();
  s.create("A");
  const locked = s.save({ ...entry(), unlockDate: "2099-01-01" });
  assert.equal(s.list().length, 0);
  assert.throws(() => s.get(locked), /未到/);
  assert.throws(() => s.addReply(s.active(), locked, 0, {}), /未到/);
});
test("late reply rejected after account switch and revision change", () => {
  const s = setup();
  const a = s.create("A");
  const eid = s.save(entry());
  const version = s.get(eid).updatedAt;
  s.create("B");
  assert.throws(() => s.addReply(a.id, eid, version, {}), /切换/);
  s.switch(a.id);
  assert.throws(() => s.addReply(a.id, eid, version - 1, {}), /修改/);
});
test("versions and trash restore real content", () => {
  const s = setup();
  s.create("A");
  const eid = s.save(entry());
  s.save({ ...s.get(eid), body: "new" });
  s.restoreVersion(eid, 0);
  assert.equal(s.get(eid).body, "散步");
  s.delete(eid);
  assert.equal(s.list().length, 0);
  s.restore(eid);
  assert.equal(s.list().length, 1);
});
test("storage failure does not publish a partial state", () => {
  let fail = false;
  const s = createStore({
    get: () => null,
    set: () => {
      if (fail) throw Error("full");
    },
  });
  s.create("A");
  fail = true;
  assert.throws(() => s.save(entry()), /full/);
  assert.equal(s.list().length, 0);
});
test("backup refuses unsupported paths and imports as new account", () => {
  const s = setup();
  s.create("A");
  const eid = s.save(entry());
  const data = s.exportAccount();
  s.importAccount(data);
  assert.equal(s.accounts().length, 2);
  data.account.entries[0].photos = ["../../secret"];
  assert.throws(() => s.importAccount(data), /校验/);
});
test("deleted summary source is hidden from detail and card consumers", () => {
  const s = setup();
  s.create("A");
  const a = s.save(entry()),
    b = s.save(entry());
  s.addReply(s.active(), a, s.get(a).updatedAt, {
    reply: "summary",
    sources: [{ id: a }, { id: b }],
  });
  assert.equal(s.get(a).replies.length, 1);
  s.delete(b);
  assert.equal(s.get(a).replies.length, 0);
  assert.equal(s.list()[0].replies.length, 0);
});
test("suggestion undo restores all metadata and invalidates old reply version", () => {
  const s = setup();
  s.create("A");
  const a = s.save(entry());
  const v = s.get(a).updatedAt;
  s.applySuggestions(a, {
    version: v,
    title: "new",
    tags: ["new"],
    color: "#123456",
  });
  s.undoSuggestions(a);
  assert.equal(s.get(a).title, "一天");
  assert.deepEqual(s.get(a).tags, ["散步"]);
  assert.equal(s.get(a).color, "");
  assert.throws(() => s.applySuggestions(a, { version: v }), /变化/);
});
test("record backup retains validated reply history without importing arbitrary fields", () => {
  const s = setup();
  s.create("A");
  const eid = s.save(entry());
  s.addReply(s.active(), eid, s.get(eid).updatedAt, {
    reply: "history",
    tone: "gentle",
  });
  const b = s.exportAccount();
  b.account.entries[0].suggestionUndo = { title: "untrusted" };
  s.importAccount(b);
  assert.equal(s.get(eid).replies[0].reply, "history");
  assert.equal(s.get(eid).suggestionUndo, undefined);
});
test("one-day period and dual reply survive account backup", () => {
  const s = setup();
  s.create("A");
  const eid = s.save({ ...entry(), period: "night" });
  s.addReply(s.active(), eid, s.get(eid).updatedAt, {
    reply: "温柔视角",
    alternateReply: "清醒视角",
    mode: "dual",
  });
  s.importAccount(s.exportAccount());
  assert.equal(s.get(eid).period, "night");
  assert.equal(s.get(eid).replies[0].alternateReply, "清醒视角");
});

test("tracked curio actions are isolated and survive account backup", () => {
  const s = setup();
  s.create("A");
  s.track("review");
  s.track("review");
  s.track("card");
  assert.equal(s.account().metrics.review, 2);
  assert.equal(s.account().metrics.card, 1);
  assert.ok(s.account().achievements.includes("review"));
  const backup = s.exportAccount();
  s.importAccount(backup);
  assert.equal(s.account().metrics.review, 2);
  assert.equal(s.account().metrics.card, 1);
  assert.throws(() => s.track("unknown"), /未知/);
});
