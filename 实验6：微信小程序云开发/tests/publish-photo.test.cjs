const test = require('node:test');
const assert = require('node:assert/strict');

const { createPublishPhotoHandler } = require('../cloudfunctions/publishPhoto/handler');

test('publishPhoto stores metadata with the trusted caller openid', async () => {
  let savedRecord;
  const serverDate = { serverDate: true };
  const cloud = {
    getWXContext: () => ({ OPENID: 'trusted-openid' }),
    database: () => ({
      serverDate: () => serverDate,
      collection: (name) => {
        assert.equal(name, 'photos');
        return {
          add: async ({ data }) => {
            savedRecord = data;
            return { _id: 'photo-id' };
          },
        };
      },
    }),
  };
  const publishPhoto = createPublishPhotoHandler(cloud);

  const result = await publishPhoto({
    _openid: 'spoofed-openid',
    photoUrl: 'cloud://env.bucket/photos/trusted-openid/photo.jpg',
    cloudPath: 'photos/trusted-openid/photo.jpg',
    nickName: 'OLIVIA',
    province: '北京市',
  });

  assert.deepEqual(result, {
    ok: true,
    _id: 'photo-id',
    _openid: 'trusted-openid',
  });
  assert.equal(savedRecord._openid, 'trusted-openid');
  assert.equal(savedRecord.photoUrl, 'cloud://env.bucket/photos/trusted-openid/photo.jpg');
  assert.equal(savedRecord.createdAt, serverDate);
  assert.equal(savedRecord.nickName, 'OLIVIA');
});

test('publishPhoto rejects local paths so invisible records are not created', async () => {
  const cloud = {
    getWXContext: () => ({ OPENID: 'trusted-openid' }),
    database: () => {
      throw new Error('database should not be called');
    },
  };
  const publishPhoto = createPublishPhotoHandler(cloud);

  await assert.rejects(
    publishPhoto({ photoUrl: 'http://tmp/local.jpg' }),
    /云存储文件无效/,
  );
});
