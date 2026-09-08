'use strict';

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(input, fallback) {
  const value = input === undefined || input === null || input === '' ? new Date() : input;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback || '';
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getFileExtension(filePath) {
  const match = String(filePath || '').match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

function buildCloudPath(options, filePath, now) {
  const params = options && typeof options === 'object'
    ? options
    : { openid: options, filePath, now };
  const openid = String(params.openid || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
  const extension = getFileExtension(params.filePath || params.filename || 'jpg');
  const timestamp = params.now instanceof Date
    ? params.now.getTime()
    : Number(params.now) || Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `photos/${openid}/${timestamp}-${suffix}.${extension}`;
}

function formatPhotoRecord(data) {
  const source = data || {};
  const profile = source.profile || {};
  const createdAt = source.createdAt || source.addDate || new Date();
  return {
    photoUrl: source.photoUrl || '',
    cloudPath: source.cloudPath || '',
    avatarUrl: source.avatarUrl || profile.avatarUrl || '',
    nickName: source.nickName || profile.nickName || '匿名用户',
    country: source.country || profile.country || '',
    province: source.province || profile.province || '',
    city: source.city || profile.city || '',
    addDate: source.addDate || formatDate(createdAt),
    createdAt,
    ...(source._id ? { _id: source._id } : {}),
    ...(source._openid ? { _openid: source._openid } : {}),
  };
}

module.exports = {
  formatDate,
  getFileExtension,
  buildCloudPath,
  formatPhotoRecord,
};

