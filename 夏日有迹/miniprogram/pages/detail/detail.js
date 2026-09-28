const {
  store,
  guard,
  theme,
  toast,
  view,
  confirm,
} = require("../../lib/runtime");
Page({
  data: { entry: null, locked: false, versions: false },
  onLoad(o) {
    this.id = o.id;
  },
  onShow() {
    this.refresh();
  },
  refresh() {
    if (!guard()) return;
    try {
      const raw = store.get(this.id, true);
      const locked = !store.visible(raw);
      this.setData({
        theme: theme(),
        locked,
        entry: locked
          ? { id: raw.id, title: raw.title, unlockDate: raw.unlockDate }
          : view(raw),
        related: locked ? [] : store.related(this.id).map(view),
      });
    } catch (e) {
      toast(e);
      this.setData({ error: e.message, entry: null });
    }
  },
  edit() {
    wx.navigateTo({ url: "/pages/editor/editor?id=" + this.id });
  },
  letter() {
    wx.navigateTo({ url: "/pages/letter/letter?id=" + this.id });
  },
  card() {
    wx.navigateTo({ url: "/pages/card/card?id=" + this.id });
  },
  favorite() {
    try {
      store.favorite(this.id);
      this.refresh();
    } catch (e) {
      toast(e);
    }
  },
  async remove() {
    if (await confirm("将记录移入回收站？", "可以在“我的”中恢复这篇记录。")) {
      try {
        store.delete(this.id);
        wx.navigateBack({
          fail: () => wx.switchTab({ url: "/pages/home/home" }),
        });
      } catch (e) {
        toast(e);
      }
    }
  },
  toggleVersions() {
    this.setData({ versions: !this.data.versions });
  },
  async restore(e) {
    const i = Number(e.currentTarget.dataset.index);
    const v = this.data.entry.versions[i];
    if (
      await confirm("恢复这个文本版本？", v.title + "\n" + v.body.slice(0, 300))
    ) {
      try {
        store.restoreVersion(this.id, i);
        this.refresh();
      } catch (e) {
        toast(e);
      }
    }
  },
  preview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.entry.photos,
    });
  },
  open(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
});
