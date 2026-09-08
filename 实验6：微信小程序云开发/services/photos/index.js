const { cloudbaseTemplateConfig } = require('../../config/index');
const {
  buildCloudPath,
  formatPhotoRecord,
  formatDate,
} = require('../../utils/photo');

const COLLECTION = 'photos';
const LOCAL_KEY = 'photoCommunityLocalPhotos';
const LOCAL_OPENID = 'local-user';

const DEMO_PHOTOS = [
  {
    _id: 'demo-photo-1',
    _openid: 'demo-user-1',
    photoUrl: 'https://main.qcloudimg.com/raw/f859ae9d38d34a5ddaa89ae108109cd4.png',
    avatarUrl: 'https://main.qcloudimg.com/raw/d67947625863875ce7ddb63362a3d408.png',
    nickName: '云端旅人',
    province: '广东',
    country: '中国',
    addDate: '2025-01-06',
    createdAt: '2025-01-06T09:30:00.000Z',
  },
  {
    _id: 'demo-photo-2',
    _openid: 'demo-user-2',
    photoUrl: 'https://qcloudimg.tencent-cloud.cn/raw/3ea5139beeae6c4e2e98d30ad1ed7ade.png',
    avatarUrl: 'https://main.qcloudimg.com/raw/fc24032529a6aa03a98018434407cd5a.png',
    nickName: '小小设计师',
    province: '安徽',
    country: '中国',
    addDate: '2025-01-05',
    createdAt: '2025-01-05T11:20:00.000Z',
  },
  {
    _id: 'demo-photo-3',
    _openid: 'demo-user-1',
    photoUrl: 'https://main.qcloudimg.com/raw/962c82d62bf201702204a74b4a20035c.png',
    avatarUrl: 'https://main.qcloudimg.com/raw/d67947625863875ce7ddb63362a3d408.png',
    nickName: '云端旅人',
    province: '广东',
    country: '中国',
    addDate: '2025-01-04',
    createdAt: '2025-01-04T15:45:00.000Z',
  },
];

function hasStorage() {
  return typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function';
}

function normalize(photo) {
  const item = formatPhotoRecord(photo);
  return {
    ...photo,
    ...item,
    fileID: sourceFileId(photo),
    avatarFileID: sourceAvatarId(photo),
    displayDate: item.addDate || formatDate(item.createdAt),
  };
}

function sourceFileId(photo) {
  const source = photo || {};
  return source.fileID || source.photoFileID || source.photoUrl || '';
}

function sourceAvatarId(photo) {
  const source = photo || {};
  return source.avatarFileID || source.avatarUrl || '';
}

async function resolvePhotoUrls(photos) {
  const list = Array.isArray(photos) ? photos : [];
  const fileIDs = Array.from(new Set(list
    .reduce((ids, item) => ids.concat([item.fileID || item.photoUrl, item.avatarFileID || item.avatarUrl]), [])
    .filter((fileID) => /^cloud:\/\//.test(fileID))));
  if (!fileIDs.length || typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') return list;
  try {
    const urls = {};
    for (let index = 0; index < fileIDs.length; index += 50) {
      try {
        const response = await wx.cloud.getTempFileURL({ fileList: fileIDs.slice(index, index + 50) });
        (response.fileList || []).forEach((item) => {
          if (item.fileID && item.tempFileURL) urls[item.fileID] = item.tempFileURL;
        });
      } catch (error) {
        // Keep resolving other batches if one stale/deleted file is present.
      }
    }
    return list.map((item) => ({
      ...item,
      photoUrl: urls[item.fileID] || item.photoUrl,
      avatarUrl: urls[item.avatarFileID] || item.avatarUrl,
    }));
  } catch (error) {
    return list;
  }
}

function readLocalPhotos() {
  if (!hasStorage()) return DEMO_PHOTOS.map(normalize);
  const stored = wx.getStorageSync(LOCAL_KEY);
  if (Array.isArray(stored)) return stored.map(normalize);
  const seeded = DEMO_PHOTOS.map(normalize);
  wx.setStorageSync(LOCAL_KEY, seeded);
  return seeded;
}

function writeLocalPhotos(photos) {
  if (hasStorage()) wx.setStorageSync(LOCAL_KEY, photos);
  return photos;
}

function sortPhotos(photos) {
  return photos.slice().sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.addDate || 0).getTime();
    const rightTime = new Date(right.createdAt || right.addDate || 0).getTime();
    return rightTime - leftTime;
  });
}

function localList({ page = 1, pageSize = 20, openid } = {}) {
  const all = sortPhotos(readLocalPhotos()).filter((item) => !openid || item._openid === openid);
  const start = Math.max(0, page - 1) * pageSize;
  const list = all.slice(start, start + pageSize);
  return Promise.resolve({
    list,
    total: all.length,
    hasMore: start + list.length < all.length,
    source: 'local',
  });
}

function getDatabase() {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.database !== 'function') {
    throw new Error('微信云开发不可用，请在微信开发者工具中开启云开发');
  }
  return wx.cloud.database();
}

function shouldFallback() {
  return cloudbaseTemplateConfig.allowPhotoFallback !== false;
}

async function listPhotos({ page = 1, pageSize = 20, openid } = {}) {
  if (cloudbaseTemplateConfig.photoUseMock === true) {
    return localList({ page, pageSize, openid });
  }
  try {
    const collection = getDatabase().collection(COLLECTION);
    let query = collection;
    if (openid) query = query.where({ _openid: openid });
    // Avoid requiring a createdAt index; sort after reading the small community feed.
    query = query.limit(100);
    const response = await query.get();
    const all = await resolvePhotoUrls(sortPhotos((response.data || []).map(normalize)));
    const start = Math.max(0, page - 1) * pageSize;
    const list = all.slice(start, start + pageSize);
    return {
      list,
      total: all.length,
      hasMore: start + list.length < all.length,
      source: 'cloud',
    };
  } catch (error) {
    if (!shouldFallback()) throw error;
    return localList({ page, pageSize, openid });
  }
}

async function getPhoto(id) {
  if (!id) throw new Error('图片记录不存在');
  if (cloudbaseTemplateConfig.photoUseMock === true) {
    return readLocalPhotos().find((item) => item._id === id) || null;
  }
  try {
    const response = await getDatabase().collection(COLLECTION).doc(id).get();
    if (!response || !response.data) return null;
    const resolved = await resolvePhotoUrls([normalize(response.data)]);
    return resolved[0] || null;
  } catch (error) {
    if (!shouldFallback()) throw error;
    return readLocalPhotos().find((item) => item._id === id) || null;
  }
}

function uploadFile({ cloudPath, filePath }) {
  if (!filePath) return Promise.reject(new Error('未选择图片'));
  if (cloudbaseTemplateConfig.photoUseMock === true) {
    return Promise.resolve({ fileID: filePath, cloudPath, local: true });
  }
  try {
    if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.uploadFile !== 'function') {
      throw new Error('微信云存储不可用');
    }
    return wx.cloud.uploadFile({ cloudPath, filePath }).catch((error) => {
      if (shouldFallback()) return { fileID: filePath, cloudPath, local: true, error };
      throw error;
    });
  } catch (error) {
    if (shouldFallback()) return Promise.resolve({ fileID: filePath, cloudPath, local: true, error });
    return Promise.reject(error);
  }
}

async function addPhoto(data) {
  const source = data || {};
  const record = normalize({
    photoUrl: source.photoUrl,
    cloudPath: source.cloudPath,
    avatarUrl: source.avatarUrl || source.profile && source.profile.avatarUrl,
    nickName: source.nickName || source.profile && source.profile.nickName,
    country: source.country || source.profile && source.profile.country,
    province: source.province || source.profile && source.profile.province,
    city: source.city || source.profile && source.profile.city,
    addDate: source.addDate,
    createdAt: source.createdAt || new Date(),
  });
  if (cloudbaseTemplateConfig.photoUseMock === true) {
    const local = readLocalPhotos();
    const saved = {
      ...record,
      _id: record._id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      _openid: record._openid || LOCAL_OPENID,
    };
    writeLocalPhotos([saved, ...local]);
    return saved;
  }
  try {
    const cloudRecord = { ...record, createdAt: getDatabase().serverDate() };
    // _openid is generated by CloudBase from the current user context.
    delete cloudRecord._openid;
    // These are client-side aliases; the source IDs remain in photoUrl/avatarUrl.
    delete cloudRecord.fileID;
    delete cloudRecord.avatarFileID;
    const response = await getDatabase().collection(COLLECTION).add({ data: cloudRecord });
    const resolved = await resolvePhotoUrls([{ ...record, _id: response._id }]);
    return resolved[0];
  } catch (error) {
    throw error;
  }
}

function removeFile(fileID) {
  if (!fileID || String(fileID).indexOf('cloud://') !== 0) return Promise.resolve();
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.deleteFile !== 'function') {
    return Promise.resolve();
  }
  return wx.cloud.deleteFile({ fileList: [fileID] }).catch(() => undefined);
}

async function uploadPhoto({ openid, filePath, profile = {} } = {}) {
  const cloudPath = buildCloudPath({ openid: openid || LOCAL_OPENID, filePath });
  const uploaded = await uploadFile({ cloudPath, filePath });
  try {
    const record = await addPhoto({
      photoUrl: uploaded.fileID,
      cloudPath,
      profile,
      avatarUrl: profile.avatarUrl,
      nickName: profile.nickName,
      country: profile.country,
      province: profile.province,
      city: profile.city,
      addDate: formatDate(new Date()),
    });
    return { record, uploaded };
  } catch (error) {
    await removeFile(uploaded.fileID);
    throw error;
  }
}

async function deletePhoto({ id, fileID } = {}) {
  if (!id) throw new Error('图片记录不存在');
  if (cloudbaseTemplateConfig.photoUseMock === true) {
    const remaining = readLocalPhotos().filter((item) => item._id !== id);
    writeLocalPhotos(remaining);
    return { id };
  }
  const collection = getDatabase().collection(COLLECTION);
  await collection.doc(id).remove();
  await removeFile(fileID);
  return { id };
}

module.exports = {
  COLLECTION,
  listPhotos,
  getPhoto,
  uploadFile,
  addPhoto,
  removeFile,
  uploadPhoto,
  deletePhoto,
  readLocalPhotos,
  resolvePhotoUrls,
};
