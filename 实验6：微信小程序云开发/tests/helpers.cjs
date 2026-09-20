const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(relative, globals = {}, config = {}) {
  const filename = path.join(__dirname, '..', relative);
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, console, Promise, Date, setTimeout, clearTimeout,
    require(name) {
      if (name.includes('config/index')) return { cloudbaseTemplateConfig: { photoUseMock: false, allowPhotoFallback: false, ...config } };
      return require(require.resolve(name, { paths: [path.dirname(filename)] }));
    },
    ...globals,
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
  return module.exports;
}

function database(records) {
  return {
    serverDate: () => new Date(),
    collection() {
      let owner, offset = 0, limit = 20, descending = false;
      const query = {
        where(filter) { owner = filter._openid; return this; },
        orderBy(field, direction) { descending = direction === 'desc'; return this; },
        skip(value) { offset = value; return this; },
        limit(value) { limit = Math.min(value, 20); return this; },
        async count() { return { total: records.filter(p => !owner || p._openid === owner).length }; },
        async get() {
          let result = records.filter(p => !owner || p._openid === owner);
          if (descending) result = result.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return { data: result.slice(offset, offset + limit) };
        },
      };
      return query;
    },
  };
}

module.exports = { load, database };
