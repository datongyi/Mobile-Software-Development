const {
  store,
  guard,
  theme,
  toast,
  view,
  MOODS,
} = require("../../lib/runtime");
Page({
  data: {
    entries: [],
    query: "",
    mood: "",
    tag: "",
    favorites: false,
    moods: MOODS,
  },
  onShow() {
    this.refresh();
  },
  refresh() {
    if (!guard()) return;
    try {
      const a = store.account();
      this.setData({
        theme: theme(),
        name: a.name,
        demo: a.demo,
        draft: !!a.draft,
        entries: store.list(this.data).map(view),
        count: store.list().length,
        tags: [...new Set(store.list().flatMap((e) => e.tags))].slice(0, 10),
      });
    } catch (e) {
      toast(e);
    }
  },
  search(e) {
    this.setData({ query: e.detail.value });
    this.refresh();
  },
  filter(e) {
    const { key, value } = e.currentTarget.dataset;
    this.setData({ [key]: this.data[key] === value ? "" : value });
    this.refresh();
  },
  favoriteFilter() {
    this.setData({ favorites: !this.data.favorites });
    this.refresh();
  },
  clear() {
    this.setData({ query: "", mood: "", tag: "", favorites: false });
    this.refresh();
  },
  create() {
    wx.navigateTo({ url: "/pages/editor/editor" });
  },
  open(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
  onShareAppMessage() {
    return {
      title: "夏日有迹 · 留住生活里的小小瞬间",
      path: "/pages/home/home",
    };
  },
});
