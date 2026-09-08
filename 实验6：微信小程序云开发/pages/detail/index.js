const { getPhoto } = require('../../services/photos/index');
Page({
  data: { photo: null, loading: false, error: '' },
  onLoad(options) { this.photoId = decodeURIComponent(options.id || ''); this.loadPhoto(); },
  async loadPhoto() { this.setData({ loading: true, error: '' }); try { const photo = await getPhoto(this.photoId); if (!photo) throw new Error('图片不存在或已删除'); this.setData({ photo }); wx.setNavigationBarTitle({ title: photo.nickName ? `${photo.nickName}的图片` : '图片详情' }); } catch (error) { this.setData({ error: error.message || '图片加载失败' }); } finally { this.setData({ loading: false }); } },
  retry() { this.loadPhoto(); },
  previewPhoto() { if (this.data.photo && this.data.photo.photoUrl) wx.previewImage({ urls: [this.data.photo.photoUrl] }); },
  async downloadPhoto() {
    const fileID = this.data.photo && (this.data.photo.fileID || this.data.photo.photoUrl); if (!fileID) return;
    const displayUrl = this.data.photo && this.data.photo.photoUrl;
    try { wx.showLoading({ title: '保存中' }); const downloaded = /^cloud:\/\//.test(fileID) && wx.cloud ? await wx.cloud.downloadFile({ fileID }) : { tempFilePath: displayUrl || fileID }; await new Promise((resolve, reject) => wx.saveImageToPhotosAlbum({ filePath: downloaded.tempFilePath, success: resolve, fail: reject })); wx.showToast({ title: '已保存到相册', icon: 'success' }); }
    catch (error) { if (error && /auth|scope|permission/i.test(error.errMsg || '')) wx.showModal({ title: '需要相册权限', content: '请在设置中允许保存图片到相册', success: (result) => { if (result.confirm) wx.openSetting(); } }); else wx.showToast({ title: '保存失败，请重试', icon: 'none' }); }
    finally { wx.hideLoading(); }
  },
  onShareAppMessage() { return { title: `${this.data.photo && this.data.photo.nickName || '用户'}分享了一张图片`, path: `/pages/detail/index?id=${this.photoId}`, imageUrl: this.data.photo && this.data.photo.photoUrl }; },
});
