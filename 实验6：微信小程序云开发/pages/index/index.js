const { listPhotos } = require('../../services/photos/index');

Page({
  data: { photos: [], page: 1, pageSize: 10, hasMore: true, loading: false, loadingMore: false, error: '' },

  onLoad() { this.loadPhotos(true); },
  onShow() { if (this.loaded) this.loadPhotos(true); },
  onPullDownRefresh() { this.loadPhotos(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && !this.data.loadingMore) this.loadPhotos(false);
  },

  async loadPhotos(reset) {
    const nextPage = reset ? 1 : this.data.page + 1;
    this.setData(reset ? { loading: true, error: '' } : { loadingMore: true });
    try {
      const result = await listPhotos({ page: nextPage, pageSize: this.data.pageSize });
      this.setData({
        photos: reset ? result.list : this.data.photos.concat(result.list),
        page: nextPage,
        hasMore: result.hasMore,
        error: '',
      });
      this.loaded = true;
    } catch (error) {
      this.setData({ error: error.message || '图片加载失败，请重试' });
    } finally {
      this.setData({ loading: false, loadingMore: false });
    }
  },

  retry() { this.loadPhotos(true); },
  goAdd() { wx.navigateTo({ url: '/pages/add/index' }); },
  async goMine() {
    const app = getApp();
    try {
      const openid = app.getOpenid ? await app.getOpenid() : 'local-user';
      wx.navigateTo({ url: `/pages/homepage/index?id=${encodeURIComponent(openid)}` });
    } catch (error) {
      wx.showToast({ title: error.message || '云端身份获取失败', icon: 'none' });
    }
  },
  onPhotoDetail(event) {
    const id = event.detail && event.detail._id;
    if (id) wx.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` });
  },
  onPhotoAuthor(event) {
    const openid = event.detail && event.detail._openid;
    if (openid) wx.navigateTo({ url: `/pages/homepage/index?id=${encodeURIComponent(openid)}` });
  },
});
