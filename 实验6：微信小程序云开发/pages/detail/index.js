const { getPhoto } = require('../../services/photos/index');
const { errorMessage, isLocalImage } = require('../../utils/photo');

Page({
  data: { photo: null, loading: false, saving: false, error: '', imageError: false },
  onLoad(options) { this.photoId = decodeURIComponent(options.id || ''); },
  onShow() { this.loadPhoto(); },
  async loadPhoto() {
    this.setData({ loading: true, error: '', imageError: false });
    try {
      const photo = await getPhoto(this.photoId);
      if (!photo) throw new Error('图片不存在或已删除');
      this.setData({ photo });
      wx.setNavigationBarTitle({ title: photo.nickName ? `${photo.nickName}的图片` : '图片详情' });
    } catch (error) { this.setData({ photo: null, error: errorMessage(error, '图片加载失败') }); }
    finally { this.setData({ loading: false }); }
  },
  retry() { this.loadPhoto(); },
  onImageError() { this.setData({ imageError: true }); },
  previewPhoto() { if (this.data.photo && this.data.photo.photoUrl) wx.previewImage({ current: this.data.photo.photoUrl, urls: [this.data.photo.photoUrl] }); },
  openAuthor() { const openid = this.data.photo && this.data.photo._openid; if (openid) wx.navigateTo({ url: `/pages/homepage/index?id=${encodeURIComponent(openid)}` }); },
  async downloadPhoto() {
    const fileID = this.data.photo && (this.data.photo.fileID || this.data.photo.photoUrl);
    if (!fileID || this.data.saving) return;
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中' });
    try {
      let filePath;
      if (/^cloud:\/\//.test(fileID)) {
        const downloaded = await wx.cloud.downloadFile({ fileID });
        filePath = downloaded.tempFilePath;
      } else if (isLocalImage(fileID)) {
        filePath = fileID;
      } else {
        const downloaded = await new Promise((resolve, reject) => wx.downloadFile({ url: this.data.photo.photoUrl || fileID, success: resolve, fail: reject }));
        if (downloaded.statusCode !== 200) throw new Error('图片下载失败');
        filePath = downloaded.tempFilePath;
      }
      await new Promise((resolve, reject) => wx.saveImageToPhotosAlbum({ filePath, success: resolve, fail: reject }));
      wx.hideLoading();
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      if (/auth|scope|permission/i.test(error.errMsg || error.message || '')) {
        wx.showModal({ title: '需要相册权限', content: '请在设置中允许保存图片到相册', success: result => { if (result.confirm) wx.openSetting(); } });
      } else wx.showToast({ title: errorMessage(error, '保存失败，请重试'), icon: 'none' });
    } finally { this.setData({ saving: false }); }
  },
  onShareAppMessage() {
    return { title: `${this.data.photo && this.data.photo.nickName || '用户'}分享了一张图片`, path: `/pages/detail/index?id=${encodeURIComponent(this.photoId || '')}`, imageUrl: this.data.photo && this.data.photo.photoUrl };
  },
});
