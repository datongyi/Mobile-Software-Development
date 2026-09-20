const { listPhotos } = require('../../services/photos/index');
const { errorMessage } = require('../../utils/photo');

Page({
  data: { photos: [], page: 1, pageSize: 10, hasMore: true, loading: false, loadingMore: false, error: '' },

  onShow() { this.loadPhotos(true); },
  onPullDownRefresh() { this.loadPhotos(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && !this.data.loadingMore) this.loadPhotos(false);
  },

  async loadPhotos(reset) {
    if (!reset && (this.data.loading || this.data.loadingMore || !this.data.hasMore)) return;
    const request = this.request = (this.request || 0) + 1;
    const nextPage = reset ? 1 : this.data.page + 1;
    this.setData(reset ? { loading: true, error: '' } : { loadingMore: true });
    try {
      const result = await listPhotos({ page: nextPage, pageSize: this.data.pageSize });
      if (request !== this.request) return;
      const seen = new Set(this.data.photos.map(item => item._id));
      this.setData({
        photos: reset ? result.list : this.data.photos.concat(result.list.filter(item => !seen.has(item._id))),
        page: nextPage,
        hasMore: result.hasMore,
        error: '',
      });
      this.loaded = true;
    } catch (error) {
      if (request === this.request) this.setData({ error: errorMessage(error, '图片加载失败，请重试') });
    } finally {
      if (request === this.request) this.setData({ loading: false, loadingMore: false });
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
      wx.showToast({ title: errorMessage(error, '云端身份获取失败'), icon: 'none' });
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
