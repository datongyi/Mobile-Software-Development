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
    photoUrl: source.fileID || source.photoFileID || source.photoUrl || '',
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

function isLocalImage(value) {
  return !!value && !/^cloud:\/\//.test(value)
    && (!/^https?:\/\//i.test(value) || /^https?:\/\/(?:tmp|usr)\//i.test(value));
}

function errorMessage(error, fallback = '操作失败，请重试') {
  const message = String(error && (error.message || error.errMsg) || '');
  if (/Cannot find module.*wx-server-sdk/.test(message)) return '发布服务缺少依赖，请部署 publishPhoto 的完整依赖后重试';
  if (/FUNCTION_NOT_FOUND|function.*not.*found|-501000/i.test(message)) return '云函数未部署，请检查 getOpenid 和 publishPhoto';
  if (/permission|PERMISSION_DENIED|DATABASE_PERMISSION_DENIED/i.test(message)) return '云端权限不足，请检查数据库和存储权限';
  if (/timeout|timed out/i.test(message)) return '请求超时，请刷新列表确认结果后重试';
  if (/network|request:fail/i.test(message)) return '网络连接失败，请检查网络后重试';
  return message || fallback;
}

module.exports = {
  formatDate,
  getFileExtension,
  buildCloudPath,
  formatPhotoRecord,
  isLocalImage,
  errorMessage,
};
