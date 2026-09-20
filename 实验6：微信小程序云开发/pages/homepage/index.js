const { listPhotos, deletePhoto, removeFile } = require('../../services/photos/index');
const { errorMessage } = require('../../utils/photo');

Page({
  data: { openid: '', photos: [], profile: {}, loading: false, loadingMore: false, error: '', isOwner: false, page: 0, total: 0, hasMore: false, deletingId: '', pendingFiles: [] },
  onLoad(options) { this.authorId = options.id ? decodeURIComponent(options.id) : ''; },
  async onShow() {
    let currentOpenid = '';
    try { currentOpenid = await getApp().getOpenid(); }
    catch (error) {
      if (!this.authorId) { this.setData({ error: errorMessage(error, '用户身份获取失败') }); return; }
    }
    const openid = this.authorId || currentOpenid;
    this.setData({ openid, isOwner: !!currentOpenid && currentOpenid === openid });
    await this.loadPhotos(true);
  },
  onPullDownRefresh() { this.onShow().finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() { if (this.data.hasMore) this.loadPhotos(false); },
  async loadPhotos(reset = true) {
    if (!this.data.openid) return this.setData({ error: '作者信息不存在' });
    if (!reset && (this.data.loading || this.data.loadingMore || !this.data.hasMore)) return;
    const request = this.request = (this.request || 0) + 1;
    const page = reset ? 1 : this.data.page + 1;
    this.setData(reset ? { loading: true, error: '' } : { loadingMore: true, error: '' });
    try {
      const result = await listPhotos({ openid: this.data.openid, page, pageSize: 20 });
      if (request !== this.request) return;
      const seen = new Set(this.data.photos.map(item => item._id));
      const photos = reset ? result.list : this.data.photos.concat(result.list.filter(item => !seen.has(item._id)));
      const profile = photos[0] || (this.data.isOwner ? wx.getStorageSync('photoCommunityProfile') : {}) || {};
      this.setData({ photos, profile, page, total: result.total, hasMore: result.hasMore });
      wx.setNavigationBarTitle({ title: this.data.isOwner ? '我的主页' : `${profile.nickName || '作者'}的主页` });
    } catch (error) {
      if (request === this.request) this.setData({ error: errorMessage(error, '作品加载失败') });
    } finally {
      if (request === this.request) this.setData({ loading: false, loadingMore: false });
    }
  },
  retry() { this.onShow(); },
  loadMore() { this.loadPhotos(false); },
  onPhotoDetail(event) { const id = event.detail && event.detail._id; if (id) wx.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(id)}` }); },
  onPhotoAuthor() {},
  goAdd() { wx.navigateTo({ url: '/pages/add/index' }); },
  async retryCleanup() {
    const remaining = [];
    for (const file of this.data.pendingFiles) { if (!await removeFile(file)) remaining.push(file); }
    this.setData({ pendingFiles: remaining });
    wx.showToast({ title: remaining.length ? '清理未完成，请稍后重试' : '文件已清理', icon: 'none' });
  },
  async deleteConfirmedPhoto(item) {
    // Only operate on a record currently displayed on the current user's page.
    if (!this.data.isOwner || !item) return;
    const record = this.data.photos.find(photo => photo._id === item._id && photo._openid === this.data.openid);
    if (!record) return;
    item = record;
    this.setData({ deletingId: item._id });
    try {
      wx.showLoading({ title: '删除中' });
      const fileID = item.fileID || item.photoUrl;
      const deleted = await deletePhoto({ id: item._id, fileID });
      if (!deleted.fileDeleted) this.setData({ pendingFiles: this.data.pendingFiles.concat(fileID) });
      await this.loadPhotos(true);
      wx.hideLoading();
      wx.showToast({ title: deleted.fileDeleted ? '已删除' : '记录已删除，文件待清理', icon: deleted.fileDeleted ? 'success' : 'none' });
    } catch (error) {
      wx.hideLoading();
      this.setData({ error: errorMessage(error, '删除失败') });
    } finally { this.setData({ deletingId: '' }); }
  },
  removePhoto(event) {
    const item = event.currentTarget.dataset.item;
    if (!item || !this.data.isOwner || this.data.deletingId) return;
    this.setData({ deletingId: item._id });
    wx.showModal({ title: '删除图片', content: '删除后无法恢复，确定继续吗？', success: async (result) => {
      if (!result.confirm) { this.setData({ deletingId: '' }); return; }
      await this.deleteConfirmedPhoto(item);
    }, fail: () => this.setData({ deletingId: '' }) });
  },
});
