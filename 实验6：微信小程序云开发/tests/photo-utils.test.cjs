const test = require('node:test');
const assert = require('node:assert/strict');
const {
  formatDate,
  getFileExtension,
  buildCloudPath,
  formatPhotoRecord,
} = require('../utils/photo');

test('formatDate formats valid dates and falls back for invalid values', () => {
  assert.equal(formatDate('2026-09-08T12:00:00Z'), '2026-09-08');
  assert.equal(formatDate('bad-date', 'unknown'), 'unknown');
});

test('getFileExtension handles query strings and missing extensions', () => {
  assert.equal(getFileExtension('/tmp/a.PNG?x=1'), 'png');
  assert.equal(getFileExtension('no-extension'), 'jpg');
});

test('buildCloudPath creates a scoped path with the source extension', () => {
  const path = buildCloudPath({ openid: 'user/1', filePath: 'photo.webp', now: 1000 });
  assert.match(path, /^photos\/user_1\/1000-[a-z0-9]+\.webp$/);
});

test('formatPhotoRecord supplies stable display fields', () => {
  const record = formatPhotoRecord({
    photoUrl: 'cloud://photo',
    profile: { nickName: '小明', province: '安徽' },
    createdAt: '2026-01-02T00:00:00Z',
  });
  assert.equal(record.nickName, '小明');
  assert.equal(record.province, '安徽');
  assert.equal(record.addDate, '2026-01-02');
});

