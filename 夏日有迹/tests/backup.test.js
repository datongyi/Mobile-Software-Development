const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const { createStore, dateKey } = require("../miniprogram/lib/store");
function setup() {
  const files = new Map();
  const store = createStore({
    get: () => null,
    set: () => {},
    userPath: "/local/",
  });
  store.create("A");
  const mock = {
    readFileSync: (p) => {
      if (!files.has(p)) throw Error("missing");
      return files.get(p);
    },
    writeFileSync: (p, v) => files.set(p, v),
    statSync: (p) => ({ size: files.get(p).length }),
    unlinkSync: (p) => files.delete(p),
  };
  const sandbox = {
    require: () => ({ store }),
    wx: { env: { USER_DATA_PATH: "/local" }, getFileSystemManager: () => mock },
    module: { exports: {} },
    Date,
    Error,
    JSON,
  };
  vm.runInNewContext(
    fs.readFileSync("miniprogram/lib/backup.js", "utf8"),
    sandbox,
  );
  return { store, files, api: sandbox.module.exports };
}
test("backup embeds durable photos and restores in a new account", async () => {
  const { store, files, api } = setup();
  files.set("/local/photo.jpg", "/9j/AAAA");
  store.save({
    title: "test",
    body: "body",
    date: dateKey(),
    photos: ["/local/photo.jpg"],
    tags: [],
  });
  const old = store.active();
  const path = await api.exportBackup();
  assert.match(files.get(path), /backup:image-0/);
  await api.importBackup(path);
  assert.notEqual(store.active(), old);
  assert.equal(store.list().length, 1);
  assert.match(store.list()[0].photos[0], /^\/local\/import-/);
});
test("malformed backup cannot replace existing account or leave image files", async () => {
  const { store, files, api } = setup();
  const owner = store.active();
  files.set(
    "/bad.json",
    JSON.stringify({
      schema: 1,
      account: { entries: [{ photos: ["../../secret"] }] },
    }),
  );
  await assert.rejects(api.importBackup("/bad.json"));
  assert.equal(store.active(), owner);
  assert.equal(store.accounts().length, 1);
});
