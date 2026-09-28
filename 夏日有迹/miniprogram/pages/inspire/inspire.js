const { store, guard, theme, toast, dateKey } = require("../../lib/runtime");
const { CATEGORIES, evaluateCurios } = require("../../lib/curios");
const prompts = [
  "今天，有哪个瞬间让你想多停留一会儿？",
  "如果给今天取一种颜色，它会是什么？",
  "写下最近一个被你忽略的小小进步。",
  "你想把今天的哪一阵风，寄给未来的自己？",
  "最近一次开怀大笑，是因为什么？",
  "今天吃到的东西里，哪一种最有记忆点？",
  "给一位很久没联系的人，写一句没有寄出的问候。",
  "有什么平凡的小事，让你觉得生活还不错？",
];
Page({
  data: {
    prompt: prompts[0],
    categories: CATEGORIES,
    curioCategory: "全部",
    badges: [],
  },
  onShow() {
    if (!guard()) return;
    try {
      const a = store.account();
      const allBadges = evaluateCurios(
        a,
        store.list(),
        store.capsules(),
        dateKey(),
      );
      this.allBadges = allBadges;
      this.setData({
        theme: theme(),
        capsules: store.capsules(),
        badges: this.filteredBadges(allBadges, this.data.curioCategory),
        earnedCurios: allBadges.filter((badge) => badge.level > 0).length,
        curioLevels: allBadges.reduce((sum, badge) => sum + badge.level, 0),
      });
    } catch (e) {
      toast(e);
    }
  },
  draw() {
    let next = this.data.prompt;
    while (next === this.data.prompt)
      next = prompts[Math.floor(Math.random() * prompts.length)];
    try {
      store.track("prompt");
      this.setData({ prompt: next });
      this.onShow();
    } catch (e) {
      toast(e);
    }
  },
  filteredBadges(badges, category) {
    return category === "全部"
      ? badges
      : badges.filter((badge) => badge.category === category);
  },
  curioFilter(e) {
    const curioCategory = e.currentTarget.dataset.category;
    this.setData({
      curioCategory,
      badges: this.filteredBadges(this.allBadges || [], curioCategory),
    });
  },
  write() {
    wx.navigateTo({
      url:
        "/pages/editor/editor?prompt=" +
        encodeURIComponent(this.data.prompt + "\n\n"),
    });
  },
  capsule() {
    wx.navigateTo({ url: "/pages/editor/editor?capsule=1" });
  },
  open(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
  question() {
    wx.navigateTo({ url: "/pages/letter/letter?mode=question" });
  },
  studio() {
    wx.navigateTo({ url: "/pages/studio/studio" });
  },
});
