const { buildCloudPath } = require('../../utils/photo');
const { uploadFile, uploadPhoto, listPhotos } = require('../../services/photos/index');

const PROFILE_KEY = 'photoCommunityProfile';

Page({
  data: {
    selectedImage: '', avatarUrl: '', nickName: '', region: ['', '', ''],
    historyPhotos: [], openid: '', loading: false, uploading: false, error: '',
  },

  onLoad() {
    const profile = wx.getStorageSync(PROFILE_KEY) || {};
    this.setData({ avatarUrl: profile.avatarUrl || '', nickName: profile.nickName || '', region: profile.region || ['', '', ''] });
    const app = getApp();
    (app.getOpenid ? app.getOpenid() : Promise.resolve('local-user')).then((openid) => {
      this.setData({ openid });
      this.loadHistory();
    }).catch((error) => this.setData({ error: error.message || '云端身份获取失败，请重新编译后重试' }));
  },

  onShow() { if (this.data.openid) this.loadHistory(); },

  async loadHistory() {
    this.setData({ loading: true, error: '' });
    try {
      const result = await listPhotos({ openid: this.data.openid, page: 1, pageSize: 50 });
      this.setData({ historyPhotos: result.list || [] });
    } catch (error) {
      this.setData({ error: error.message || '历史记录加载失败' });
    } finally { this.setData({ loading: false }); }
  },

  onChooseAvatar(event) { this.setData({ avatarUrl: event.detail.avatarUrl || '' }); },
  onNicknameInput(event) { this.setData({ nickName: event.detail.value || '' }); },
  onRegionChange(event) { this.setData({ region: event.detail.value || ['', '', ''] }); },

  chooseImage() {
    const choose = wx.chooseMedia ? wx.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'] }) : wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
    choose.then((result) => {
      const path = result.tempFiles && result.tempFiles[0] && result.tempFiles[0].tempFilePath || result.tempFilePaths && result.tempFilePaths[0];
      if (path) this.setData({ selectedImage: path, error: '' });
    }).catch(() => undefined);
  },

  async upload() {
    if (!this.data.selectedImage) return this.setData({ error: '请先选择一张图片' });
    if (!this.data.nickName.trim()) return this.setData({ error: '请填写昵称后再上传' });
    this.setData({ uploading: true, error: '' });
    let uploadedPhoto;
    try {
      let avatarUrl = this.data.avatarUrl;
      if (avatarUrl && /^wxfile:\/\//.test(avatarUrl)) {
        const avatarPath = buildCloudPath({ openid: this.data.openid, filePath: avatarUrl, filename: 'avatar.jpg' }).replace(/^photos\//, 'avatars/');
        const avatarResult = await uploadFile({ cloudPath: avatarPath, filePath: avatarUrl });
        avatarUrl = avatarResult.fileID;
      }
      const profile = {
        avatarUrl,
        nickName: this.data.nickName.trim(),
        country: this.data.region[0] || '', province: this.data.region[1] || '', city: this.data.region[2] || '',
      };
      uploadedPhoto = await uploadPhoto({ openid: this.data.openid, filePath: this.data.selectedImage, profile });
      wx.setStorageSync(PROFILE_KEY, { ...profile, region: this.data.region });
      this.setData({ selectedImage: '', avatarUrl, historyPhotos: [uploadedPhoto.record, ...this.data.historyPhotos] });
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (error) {
      this.setData({ error: error.message || '上传失败，请重试' });
      wx.showToast({ title: '上传失败', icon: 'none' });
    } finally { this.setData({ uploading: false }); }
  },

  openDetail(event) {
    const id = event.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
  },
  openMine() {
    if (this.data.openid) wx.navigateTo({ url: `/pages/homepage/index?id=${encodeURIComponent(this.data.openid)}` });
  },
});
