const { createStore, dateKey, MOODS, PERIODS } = require("./store");
const store = createStore({
  get: (k) => wx.getStorageSync(k),
  set: (k, v) => wx.setStorageSync(k, v),
  userPath: wx.env.USER_DATA_PATH,
});
const icons = "/assets/icons/";
function toast(error) {
  wx.showToast({
    title: error.message || String(error),
    icon: "none",
    duration: 2600,
  });
}
function guard() {
  if (!store.active()) {
    wx.redirectTo({ url: "/pages/accounts/accounts" });
    return false;
  }
  return true;
}
function theme() {
  const settings = store.account().settings;
  let value = settings.theme;
  if (value === "auto") {
    const hour = new Date().getHours();
    value = hour < 7 || hour >= 20 ? "night" : hour < 12 ? "morning" : "day";
  }
  return `theme-${value} ${settings.motion ? "" : "reduced"}`;
}
function confirm(title, content) {
  return new Promise((resolve) =>
    wx.showModal({
      title,
      content,
      success: (r) => resolve(r.confirm),
      fail: () => resolve(false),
    }),
  );
}
function view(e) {
  return {
    ...e,
    displayTitle: e.title || "没有标题的一天",
    excerpt: e.body.slice(0, 100),
    day: e.date.slice(8),
    month: e.date.slice(5, 7),
    photo: e.photos[0] || "",
    dateLabel: e.date.replace(/-/g, "."),
  };
}
function haptic() {
  if (store.account().settings.haptic)
    wx.vibrateShort({ type: "light", fail: () => {} });
}
function persistPhoto(path) {
  const fs = wx.getFileSystemManager();
  const target = `${wx.env.USER_DATA_PATH}/photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${/\.png$/i.test(path) ? "png" : "jpg"}`;
  fs.copyFileSync(path, target);
  return target;
}
function seed() {
  const a = store.create("夏日来信", true);
  const items = [
    [
      "把海风装进口袋",
      "傍晚沿着海边走了很久。风吹乱头发的时候，突然觉得今天的烦恼也没有那么大。买了一瓶冰汽水，坐到太阳慢慢落下。",
      "晴朗",
      ["海边", "散步"],
      "sea",
    ],
    [
      "路过一整个夏天",
      "没有目的地的一次散步。抬头看见树叶把阳光筛成小小的光斑，落在路上，也落在鞋尖。",
      "轻快",
      ["散步", "日常"],
      "leaves",
    ],
    [
      "给自己留半小时",
      "把手机放在一旁，读了几页书。生活不一定每天都有大事发生，安静下来也是一种收获。",
      "平静",
      ["阅读", "日常"],
      "book",
    ],
    [
      "今天，慢一点也没关系",
      "任务还没全部做完，心里有一点着急。写下来之后才发现，其实已经完成了不少。明天再继续吧。",
      "疲惫",
      ["学习", "日常"],
      "",
    ],
    [
      "周末的小小出走",
      "走进一条没去过的小路。没有打卡计划，只是随意地走走，最后发现了一片很漂亮的绿。",
      "轻快",
      ["散步", "旅行"],
      "leaves",
    ],
    [
      "窗边的一场雨",
      "下雨了。原本打算出门，最后留在窗边听雨。泡了杯茶，把前几天的照片整理好。",
      "平静",
      ["阅读", "雨天"],
      "book",
    ],
  ];
  items.forEach((x, i) => {
    const d = new Date();
    if (i === items.length - 1) d.setFullYear(d.getFullYear() - 1);
    else d.setDate(d.getDate() - i * 3);
    store.save({
      title: x[0],
      body: x[1],
      mood: x[2],
      tags: x[3],
      photos: x[4] ? [`/assets/${x[4]}.jpg`] : [],
      date: dateKey(d),
    });
  });
  const first = store.list()[0];
  store.addReply(a.id, first.id, first.updatedAt, {
    sample: true,
    reply:
      "【预置示例，非实时 AI 生成】\n\n你把傍晚交给了海风，也给忙碌的一天留了一点空白。那瓶汽水和慢慢落下的太阳，不需要有多特别，也值得被记住。\n\n愿下次翻到这一页时，你还能想起那一刻的轻松。",
    title: "把海风留在今天",
    tags: ["海边", "散步"],
    color: "#E8C7A0",
    colorName: "汽水晚霞",
    tone: "gentle",
    mode: "reply",
    sources: [{ id: first.id, version: first.updatedAt }],
  });
  return a;
}
module.exports = {
  store,
  dateKey,
  MOODS,
  PERIODS,
  icons,
  toast,
  guard,
  theme,
  confirm,
  view,
  haptic,
  persistPhoto,
  seed,
};
