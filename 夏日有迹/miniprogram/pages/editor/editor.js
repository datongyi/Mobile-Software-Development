const {
  store,
  guard,
  theme,
  toast,
  dateKey,
  MOODS,
  persistPhoto,
  confirm,
  haptic,
} = require("../../lib/runtime");
const { periodForHour } = require("../../lib/showcase");
Page({
  data: {
    id: "",
    title: "",
    body: "",
    date: dateKey(),
    mood: "平静",
    period: periodForHour(),
    periods: [
      { id: "morning", name: "早晨" },
      { id: "afternoon", name: "午后" },
      { id: "night", name: "夜晚" },
    ],
    tagText: "",
    photos: [],
    unlockDate: "",
    moods: MOODS,
    saving: false,
  },
  onLoad(options) {
    if (!guard()) return;
    try {
      this.owner = store.active();
      let e = options.id ? store.get(options.id) : store.account().draft;
      this.setData({
        theme: theme(),
        ...(e || {}),
        tagText: e ? (e.tags || []).join(" ") : "",
        unlockDate: options.capsule
          ? dateKey(new Date(Date.now() + 86400000))
          : (e && e.unlockDate) || "",
      });
      if (options.prompt && !e)
        this.setData({ body: decodeURIComponent(options.prompt) });
    } catch (e) {
      toast(e);
    }
  },
  change(e) {
    this.setData({ [e.currentTarget.dataset.key]: e.detail.value });
    this.dirty = true;
    this.persistDraft();
  },
  mood(e) {
    this.setData({ mood: e.currentTarget.dataset.value });
    this.dirty = true;
    this.persistDraft();
  },
  period(e) {
    this.setData({ period: e.currentTarget.dataset.value });
    this.dirty = true;
    this.persistDraft();
  },
  values() {
    const d = this.data;
    return {
      id: d.id,
      title: d.title,
      body: d.body,
      date: d.date,
      mood: d.mood,
      period: d.period,
      tags: d.tagText.split(/[\s,，]+/).filter(Boolean),
      photos: d.photos,
      unlockDate: d.unlockDate,
    };
  },
  persistDraft() {
    if (store.active() !== this.owner) return;
    try {
      store.draft(this.values());
      this.setData({ draftError: "" });
    } catch (e) {
      this.setData({ draftError: "草稿保存失败，请勿退出：" + e.message });
    }
  },
  photos() {
    wx.chooseMedia({
      count: 6 - this.data.photos.length,
      mediaType: ["image"],
      success: (r) => {
        try {
          const paths = r.tempFiles.map((f) => persistPhoto(f.tempFilePath));
          this.setData({ photos: this.data.photos.concat(paths) });
          this.dirty = true;
          this.persistDraft();
        } catch (e) {
          toast(e);
        }
      },
      fail: (e) => {
        if (!/cancel/.test(e.errMsg)) toast("无法读取照片，请检查相册权限");
      },
    });
  },
  removePhoto(e) {
    this.setData({
      photos: this.data.photos.filter(
        (_, i) => i !== Number(e.currentTarget.dataset.index),
      ),
    });
    this.persistDraft();
  },
  bookmark() {
    this.setData({
      body: this.data.body + "\n" + new Date().toLocaleString() + " · 此刻\n",
    });
    this.persistDraft();
  },
  async save() {
    if (this.data.saving) return;
    if (store.active() !== this.owner) {
      toast("账户已切换，请重新进入编辑");
      return;
    }
    if (
      this.data.unlockDate &&
      !this.data.id &&
      this.data.unlockDate <= dateKey()
    ) {
      toast("请选择未来的开启日期");
      return;
    }
    this.setData({ saving: true });
    try {
      const id = store.save(this.values());
      this.saved = true;
      haptic();
      wx.redirectTo({ url: "/pages/detail/detail?id=" + id });
    } catch (e) {
      toast(e);
    } finally {
      this.setData({ saving: false });
    }
  },
  onUnload() {
    if (!this.saved && this.dirty) this.persistDraft();
  },
  async discard() {
    if (await confirm("放弃这份草稿？", "已保存的记录不会被删除。")) {
      try {
        store.draft(null);
        this.saved = true;
        wx.navigateBack();
      } catch (e) {
        toast(e);
      }
    }
  },
});
