'use strict';

const COLLECTION = 'photos';
const TEXT_FIELDS = [
  'cloudPath',
  'avatarUrl',
  'nickName',
  'country',
  'province',
  'city',
  'addDate',
];

function createPublishPhotoHandler(cloud) {
  return async function publishPhoto(event = {}) {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) throw new Error('无法识别当前用户');
    if (!/^cloud:\/\//.test(event.photoUrl || '')) {
      throw new Error('云存储文件无效，请重新选择图片');
    }

    const db = cloud.database();
    const record = {
      _openid: OPENID,
      photoUrl: event.photoUrl,
      createdAt: db.serverDate(),
    };
    TEXT_FIELDS.forEach((field) => {
      record[field] = typeof event[field] === 'string' ? event[field] : '';
    });

    const response = await db.collection(COLLECTION).add({ data: record });
    return {
      ok: true,
      _id: response._id,
      _openid: OPENID,
    };
  };
}

module.exports = { createPublishPhotoHandler };
