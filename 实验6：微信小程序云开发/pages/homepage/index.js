const { listPhotos, deletePhoto } = require('../../services/photos/index');
Page({
  data: { openid: '', photos: [], profile: {}, loading: false, error: '', isOwner: false },
  async onLoad(options) {
    const openid = decodeURIComponent(options.id || '');
    const app = getApp();
    let currentOpenid = app.globalData && app.globalData.openid;
    try { currentOpenid = app.getOpenid ? await app.getOpenid() : currentOpenid; } catch (error) { currentOpenid = ''; }
    this.setData({ openid, isOwner: !!currentOpenid && currentOpenid === openid });
    this.loadPhotos();
  },
  async loadPhotos() {
    if (!this.data.openid) return this.setData({ error: '作者信息不存在' });
    this.setData({ loading: true, error: '' });
    try { const result = await listPhotos({ openid: this.data.openid, page: 1, pageSize: 100 }); const photos = result.list || []; this.setData({ photos, profile: photos[0] || {} }); wx.setNavigationBarTitle({ title: `${photos[0] && photos[0].nickName || '作者'}的主页` }); }
    catch (error) { this.setData({ error: error.message || '作品加载失败' }); }
    finally { this.setData({ loading: false }); }
  },
  retry() { this.loadPhotos(); },
  onPhotoDetail(event) { const id = event.detail && event.detail._id; if (id) wx.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` }); },
  onPhotoAuthor() {},
  removePhoto(event) {
    const item = event.currentTarget.dataset.item;
    if (!item || !this.data.isOwner) return;
    wx.showModal({ title: '删除图片', content: '删除后无法恢复，确定继续吗？', success: async (result) => {
      if (!result.confirm) return;
      try {
        wx.showLoading({ title: '删除中' });
        await deletePhoto({ id: item._id, fileID: item.fileID || item.photoUrl });
        this.setData({ photos: this.data.photos.filter((photo) => photo._id !== item._id) });
        wx.showToast({ title: '已删除', icon: 'success' });
      } catch (error) { wx.showToast({ title: error.message || '删除失败', icon: 'none' }); }
      finally { wx.hideLoading(); }
    } });
  },
});
