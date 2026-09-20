const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const utils = require('../utils/photo');

function page(name, { wx = {}, service = {}, app = {} } = {}) {
  let definition;
  load(`pages/${name}/index.js`, {
    Page: value => { definition = value; }, wx,
    getApp: () => app,
    require: name => name.includes('/services/') ? service : utils,
  });
  definition.data = { ...definition.data };
  definition.setData = patch => Object.assign(definition.data, patch);
  return definition;
}
const ui = { showLoading() {}, hideLoading() {}, showToast() {}, setNavigationBarTitle() {} };

test('HTTP image is downloaded before saving to the album; share path encodes its id', async () => {
  let saved, downloadUrl;
  const p = page('detail', { wx: { ...ui,
    downloadFile({ url, success }) { downloadUrl = url; success({ statusCode: 200, tempFilePath: 'wxfile://download.jpg' }); },
    saveImageToPhotosAlbum({ filePath, success }) { saved = filePath; success(); },
  } });
  p.data.photo = { photoUrl: 'https://example.com/photo.jpg', nickName: '作者' };
  p.photoId = 'id/with&special';
  await p.downloadPhoto();
  assert.equal(downloadUrl, 'https://example.com/photo.jpg');
  assert.equal(saved, 'wxfile://download.jpg');
  assert.equal(p.data.saving, false);
  assert.equal(p.onShareAppMessage().path, '/pages/detail/index?id=id%2Fwith%26special');
});

test('cloud images download by permanent fileID and permission denial offers settings', async () => {
  let downloadedId, modal, opened = false;
  const p = page('detail', { wx: { ...ui,
    cloud: { downloadFile: async ({ fileID }) => { downloadedId = fileID; return { tempFilePath: 'wxfile://download.jpg' }; } },
    saveImageToPhotosAlbum({ fail }) { fail({ errMsg: 'auth deny' }); },
    showModal(options) { modal = options; }, openSetting() { opened = true; },
  } });
  p.data.photo = { fileID: 'cloud://env/image.jpg', photoUrl: 'https://expired.example.com/photo.jpg' };
  await p.downloadPhoto();
  assert.equal(downloadedId, 'cloud://env/image.jpg');
  modal.success({ confirm: true });
  assert.equal(opened, true);
});

test('image picker handles callback APIs, cancellation and real errors', async () => {
  let options;
  const p = page('add', { wx: { chooseMedia(value) { options = value; value.success({ tempFiles: [{ tempFilePath: 'wxfile://chosen.jpg' }] }); } } });
  await p.chooseImage();
  assert.equal(p.data.selectedImage, 'wxfile://chosen.jpg');
  assert.equal(options.mediaType[0], 'image');
  const canceled = page('add', { wx: { chooseImage({ fail }) { fail({ errMsg: 'chooseImage:fail cancel' }); } } });
  await canceled.chooseImage();
  assert.equal(canceled.data.error, '');
  const denied = page('add', { wx: { chooseImage({ fail }) { fail({ errMsg: 'album denied' }); } } });
  await denied.chooseImage();
  assert.equal(denied.data.error, 'album denied');
});

test('upload waits for identity, rejects duplicates and survives optional profile-cache failure', async () => {
  let resolveIdentity, calls = 0;
  const identity = new Promise(resolve => { resolveIdentity = resolve; });
  const p = page('add', {
    app: { getOpenid: () => identity },
    wx: { ...ui, setStorageSync() { throw new Error('storage full'); } },
    service: {
      uploadPhoto: async ({ openid, profile }) => { calls++; assert.equal(openid, 'real-user'); assert.equal(profile.province, '浙江省'); assert.equal(profile.city, '杭州市'); return { record: { _id: 'new' } }; },
      listPhotos: async () => ({ list: [{ _id: 'new' }], total: 1, hasMore: false }),
    },
  });
  Object.assign(p.data, { selectedImage: 'wxfile://chosen.jpg', nickName: '用户', region: ['浙江省', '杭州市', '西湖区'] });
  const uploading = p.upload();
  await p.upload();
  resolveIdentity('real-user');
  await uploading;
  assert.equal(calls, 1);
  assert.equal(p.data.error, '');
  assert.equal(p.data.selectedImage, '');
  assert.equal(p.data.historyTotal, 1);
});

test('late homepage requests cannot overwrite a newer refresh', async () => {
  const pending = [];
  const p = page('index', { service: { listPhotos: () => new Promise(resolve => pending.push(resolve)) } });
  const old = p.loadPhotos(true);
  const fresh = p.loadPhotos(true);
  pending[1]({ list: [{ _id: 'new' }], hasMore: false });
  await fresh;
  pending[0]({ list: [{ _id: 'old' }], hasMore: false });
  await old;
  assert.equal(p.data.photos[0]._id, 'new');
});

test('own homepage resolves identity without a query id and refreshes after returning', async () => {
  let calls = 0;
  const p = page('homepage', { wx: { ...ui, getStorageSync: () => ({ nickName: '缓存昵称' }) }, app: { getOpenid: async () => 'me' },
    service: { listPhotos: async ({ openid }) => { assert.equal(openid, 'me'); calls++; return { list: [], total: 0, hasMore: false }; } },
  });
  p.onLoad({});
  await p.onShow(); await p.onShow();
  assert.equal(p.data.isOwner, true);
  assert.equal(p.data.profile.nickName, '缓存昵称');
  assert.equal(calls, 2);
});

test('deletion cancellation and non-owner actions never call the service', async () => {
  let calls = 0;
  const p = page('homepage', { wx: { showModal({ success }) { success({ confirm: false }); } }, service: { deletePhoto: async () => { calls++; } } });
  const item = { _id: 'mine', _openid: 'me' };
  Object.assign(p.data, { isOwner: true, openid: 'me', photos: [item] });
  p.removePhoto({ currentTarget: { dataset: { item } } });
  assert.equal(p.data.deletingId, '');
  p.data.isOwner = false;
  await p.deleteConfirmedPhoto(item);
  assert.equal(calls, 0);
});
