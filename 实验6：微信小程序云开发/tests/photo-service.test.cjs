const test = require('node:test');
const assert = require('node:assert/strict');
const { load, database } = require('./helpers.cjs');

const records = Array.from({ length: 125 }, (_, i) => ({
  _id: `photo-${i}`, _openid: i % 2 ? 'other' : 'mine',
  photoUrl: `https://example.com/${i}.jpg`, createdAt: new Date(2026, 0, i + 1),
}));

test('feed paginates newest records beyond the first database batch', async () => {
  const service = load('services/photos/index.js', { wx: { cloud: { database: () => database(records) } } });
  const first = await service.listPhotos({ pageSize: 10 });
  assert.equal(first.list[0]._id, 'photo-124');
  assert.equal(first.total, 125);
  assert.equal(first.hasMore, true);
  const third = await service.listPhotos({ page: 3, pageSize: 10 });
  assert.equal(third.list[0]._id, 'photo-104');
  const author = await service.listPhotos({ openid: 'mine', pageSize: 50 });
  assert.equal(author.list.length, 50);
  assert.equal(author.total, 63);
  assert.ok(author.list.every(p => p._openid === 'mine'));
});

test('legacy fileID records render and expired local avatars use a default', async () => {
  const db = database([{ _id: 'legacy', fileID: 'cloud://env/legacy.jpg', avatarUrl: 'http://tmp/expired.jpg' }]);
  const service = load('services/photos/index.js', { wx: { cloud: {
    database: () => db,
    getTempFileURL: async () => ({ fileList: [{ fileID: 'cloud://env/legacy.jpg', status: 0, tempFileURL: 'https://example.com/image.jpg' }] }),
  } } });
  const result = await service.listPhotos();
  assert.equal(result.list[0].photoUrl, 'https://example.com/image.jpg');
  assert.equal(result.list[0].avatarUrl, '');
});

test('failed publish cleans uploaded file and never reports success', async () => {
  const deleted = [];
  const service = load('services/photos/index.js', { wx: { cloud: {
    uploadFile: async () => ({ fileID: 'cloud://env/new.jpg' }),
    callFunction: async () => { throw { errMsg: "Cannot find module 'wx-server-sdk'" }; },
    deleteFile: async ({ fileList }) => { deleted.push(...fileList); return { fileList: [{ status: 0 }] }; },
  } } });
  await assert.rejects(service.uploadPhoto({ openid: 'mine', filePath: 'wxfile://new.jpg' }));
  assert.deepEqual(deleted, ['cloud://env/new.jpg']);
});

test('deletion must verify database removal before deleting the cloud file', async () => {
  let fileDeleted = false;
  const service = load('services/photos/index.js', { wx: { cloud: {
    database: () => ({ collection: () => ({ doc: () => ({ remove: async () => ({ stats: { removed: 0 } }) }) }) }),
    deleteFile: async () => { fileDeleted = true; },
  } } });
  await assert.rejects(service.deletePhoto({ id: 'someone-elses', fileID: 'cloud://env/theirs.jpg' }));
  assert.equal(fileDeleted, false);
});

test('partial storage deletion is reported so the user can retry cleanup', async () => {
  const service = load('services/photos/index.js', { wx: { cloud: {
    database: () => ({ collection: () => ({ doc: () => ({ remove: async () => ({ stats: { removed: 1 } }) }) }) }),
    deleteFile: async () => ({ fileList: [{ status: -1, errMsg: 'permission denied' }] }),
  } } });
  const result = await service.deletePhoto({ id: 'mine', fileID: 'cloud://env/mine.jpg' });
  assert.equal(result.fileDeleted, false);
});
