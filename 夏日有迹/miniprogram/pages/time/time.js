const {
  store,
  guard,
  theme,
  toast,
  dateKey,
  view,
  MOODS,
} = require("../../lib/runtime");
Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    selected: "",
    playing: false,
    slide: 0,
    showDayViewer: false,
    dayEntries: [],
    daySlide: 0,
    dayDate: "",
  },
  onShow() {
    this.refresh();
  },
  onHide() {
    this.stop();
  },
  onUnload() {
    this.stop();
  },
  refresh() {
    if (!guard()) return;
    try {
      const entries = store.list();
      const { year, month, selected } = this.data;
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      const days = [];
      for (let i = 0; i < new Date(year, month - 1, 1).getDay(); i++)
        days.push({ key: "empty" + i, blank: true });
      for (let d = 1; d <= new Date(year, month, 0).getDate(); d++) {
        const key = prefix + "-" + String(d).padStart(2, "0");
        const dayEntries = entries.filter((e) => e.date === key);
        days.push({
          key,
          day: d,
          count: dayEntries.length,
          morning: dayEntries.some((e) => e.period === "morning"),
          afternoon: dayEntries.some(
            (e) => !e.period || e.period === "afternoon",
          ),
          night: dayEntries.some((e) => e.period === "night"),
        });
      }
      const heat = [];
      for (let i = 364; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const key = dateKey(day);
        heat.push({
          date: key,
          count: entries.filter((e) => e.date === key).length,
        });
      }
      const stats = MOODS.map((mood) => ({
        mood,
        count: entries.filter((e) => e.mood === mood).length,
        percent: entries.length
          ? Math.round(
              (entries.filter((e) => e.mood === mood).length / entries.length) *
                100,
            )
          : 0,
      }));
      this.setData({
        theme: theme(),
        days,
        heat,
        stats,
        monthLabel: prefix,
        entries: entries.map(view),
        filtered: entries
          .filter((e) => !selected || e.date === selected)
          .map(view),
        trend: entries
          .slice(0, 14)
          .reverse()
          .map((e) => ({
            date: e.date.slice(5),
            mood: e.mood,
            height:
              { 晴朗: 90, 轻快: 75, 平静: 55, 低落: 25, 疲惫: 35 }[e.mood] ||
              55,
          })),
        anniversaries: entries
          .filter(
            (e) =>
              e.date.slice(5) === dateKey().slice(5) && e.date !== dateKey(),
          )
          .map(view),
        total: entries.length,
        activeDays: new Set(entries.map((e) => e.date)).size,
      });
    } catch (e) {
      toast(e);
    }
  },
  month(e) {
    let m = this.data.month + Number(e.currentTarget.dataset.step),
      y = this.data.year;
    if (m < 1) {
      m = 12;
      y--;
    }
    if (m > 12) {
      m = 1;
      y++;
    }
    this.setData({ month: m, year: y, selected: "" });
    this.refresh();
  },
  select(e) {
    this.setData({
      selected:
        this.data.selected === e.currentTarget.dataset.date
          ? ""
          : e.currentTarget.dataset.date,
    });
    this.refresh();
  },
  openDay(e) {
    const date = e.currentTarget.dataset.date;
    const dayEntries = (this.data.entries || []).filter(
      (entry) => entry.date === date,
    );
    if (!dayEntries.length) {
      toast("这一天没有记录");
      return;
    }
    this.setData({
      showDayViewer: true,
      dayDate: date,
      dayEntries,
      daySlide: 0,
    });
  },
  closeDay() {
    this.setData({ showDayViewer: false });
  },
  daySlide(e) {
    this.setData({ daySlide: e.detail.current });
  },
  open(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
  studio() {
    wx.navigateTo({ url: "/pages/studio/studio" });
  },
  random() {
    const list = this.data.entries.filter((e) => e.id !== this.lastId);
    const entry =
      list[Math.floor(Math.random() * list.length)] || this.data.entries[0];
    if (!entry) {
      toast("先写下一篇记录吧");
      return;
    }
    this.lastId = entry.id;
    store.track("review");
    wx.navigateTo({ url: "/pages/detail/detail?id=" + entry.id });
  },
  play() {
    if (!this.data.entries.length) {
      toast("先留下一篇记录吧");
      return;
    }
    try {
      store.track("review");
    } catch (e) {
      toast(e);
      return;
    }
    clearInterval(this.timer);
    this.setData({ showPlayer: true, playing: true });
    this.timer = setInterval(
      () =>
        this.setData({
          slide: (this.data.slide + 1) % this.data.entries.length,
        }),
      4000,
    );
  },
  stop() {
    clearInterval(this.timer);
    this.setData({ playing: false });
  },
  toggle() {
    if (this.data.playing) this.stop();
    else this.play();
  },
  close() {
    this.stop();
    this.setData({ showPlayer: false });
  },
  slide(e) {
    this.setData({ slide: e.detail.current });
  },
});
