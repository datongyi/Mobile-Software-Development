const { buildCloudPath, isLocalImage, errorMessage } = require('../../utils/photo');
const { uploadFile, uploadPhoto, listPhotos, removeFile } = require('../../services/photos/index');

const PROFILE_KEY = 'photoCommunityProfile';

Page({
  data: {
    selectedImage: '', avatarUrl: '', nickName: '', region: ['', '', ''],
    historyPhotos: [], openid: '', loading: false, uploading: false, error: '', historyError: '',
    historyPage: 0, historyTotal: 0, historyHasMore: false,
  },

  onLoad() {
    const profile = wx.getStorageSync(PROFILE_KEY) || {};
    this.setData({ avatarUrl: isLocalImage(profile.avatarUrl) ? '' : profile.avatarUrl || '', nickName: profile.nickName || '', region: profile.region || ['', '', ''] });
  },

  async ensureIdentity() {
    const openid = await getApp().getOpenid();
    this.setData({ openid });
    return openid;
  },

  async onShow() {
    try { await this.ensureIdentity(); await this.loadHistory(); }
    catch (error) { this.setData({ historyError: errorMessage(error, '用户身份获取失败') }); }
  },

  async loadHistory(reset = true) {
    if ((!reset && this.data.loading) || this.data.uploading) return;
    const request = this.historyRequest = (this.historyRequest || 0) + 1;
    this.setData({ loading: true, historyError: '' });
    try {
      const openid = await this.ensureIdentity();
      const page = reset ? 1 : this.data.historyPage + 1;
      const result = await listPhotos({ openid, page, pageSize: 20 });
      if (request !== this.historyRequest) return;
      const seen = new Set(this.data.historyPhotos.map(item => item._id));
      this.setData({ historyPhotos: reset ? result.list : this.data.historyPhotos.concat(result.list.filter(item => !seen.has(item._id))), historyPage: page, historyTotal: result.total, historyHasMore: result.hasMore });
    } catch (error) {
      if (request === this.historyRequest) this.setData({ historyError: errorMessage(error, '历史记录加载失败') });
    } finally { if (request === this.historyRequest) this.setData({ loading: false }); }
  },
  retryHistory() { this.loadHistory(); },
  loadMoreHistory() { if (this.data.historyHasMore) this.loadHistory(false); },

  onChooseAvatar(event) { this.setData({ avatarUrl: event.detail.avatarUrl || '' }); },
  onNicknameInput(event) { this.setData({ nickName: event.detail.value || '' }); this.saveProfile(); },
  onRegionChange(event) { this.setData({ region: event.detail.value || ['', '', ''] }); this.saveProfile(); },

  saveProfile() {
    const region = this.data.region;
    try {
      wx.setStorageSync(PROFILE_KEY, {
        avatarUrl: isLocalImage(this.data.avatarUrl) ? '' : this.data.avatarUrl,
        nickName: this.data.nickName.trim(), region,
        country: '中国', province: region[0] || '', city: region[1] || '', district: region[2] || '',
      });
    } catch (error) { /* Publishing does not depend on local profile storage. */ }
  },

  async chooseImage() {
    if (this.data.uploading) return;
    try {
      const result = await new Promise((resolve, reject) => {
        const options = { count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: resolve, fail: reject };
        if (typeof wx.chooseMedia === 'function') wx.chooseMedia({ ...options, mediaType: ['image'] });
        else wx.chooseImage(options);
      });
      const path = result.tempFiles && result.tempFiles[0] && result.tempFiles[0].tempFilePath || result.tempFilePaths && result.tempFilePaths[0];
      if (path) this.setData({ selectedImage: path, error: '' });
    } catch (error) {
      if (!/cancel/i.test(error.errMsg || error.message || '')) this.setData({ error: errorMessage(error, '无法选择图片，请检查相册或相机权限') });
    }
  },

  previewSelected() { if (this.data.selectedImage) wx.previewImage({ urls: [this.data.selectedImage] }); },

  async upload() {
    if (this.data.uploading) return;
    if (!this.data.selectedImage) return this.setData({ error: '请先选择一张图片' });
    if (!this.data.nickName.trim()) return this.setData({ error: '请填写昵称后再上传' });
    this.setData({ uploading: true, error: '' });
    this.historyRequest = (this.historyRequest || 0) + 1;
    this.setData({ loading: false });
    let uploadedPhoto;
    let newAvatar;
    try {
      const openid = await this.ensureIdentity();
      let avatarUrl = this.data.avatarUrl;
      if (isLocalImage(avatarUrl)) {
        const avatarPath = buildCloudPath({ openid, filePath: avatarUrl, filename: 'avatar.jpg' }).replace(/^photos\//, 'avatars/');
        const avatarResult = await uploadFile({ cloudPath: avatarPath, filePath: avatarUrl });
        newAvatar = avatarUrl = avatarResult.fileID;
      }
      const profile = {
        avatarUrl,
        nickName: this.data.nickName.trim(),
        country: '中国', province: this.data.region[0] || '', city: this.data.region[1] || '', district: this.data.region[2] || '',
      };
      uploadedPhoto = await uploadPhoto({ openid: this.data.openid, filePath: this.data.selectedImage, profile });
      // Profile cache is optional: its failure must not turn a successful publication into failure.
      try { wx.setStorageSync(PROFILE_KEY, { ...profile, region: this.data.region }); } catch (error) { /* cloud record is already saved */ }
      this.setData({ selectedImage: '', avatarUrl, historyError: '' });
      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (error) {
      if (newAvatar && !uploadedPhoto) await removeFile(newAvatar);
      this.setData({ error: errorMessage(error, '上传失败，请重试') });
      wx.showToast({ title: '上传失败', icon: 'none' });
    } finally { this.setData({ uploading: false }); }
    if (uploadedPhoto) await this.loadHistory();
  },

  openDetail(event) {
    const id = event.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
  },
  async openMine() {
    try { const openid = await this.ensureIdentity(); wx.navigateTo({ url: `/pages/homepage/index?id=${encodeURIComponent(openid)}` }); }
    catch (error) { this.setData({ error: errorMessage(error, '用户身份获取失败') }); }
  },
});
