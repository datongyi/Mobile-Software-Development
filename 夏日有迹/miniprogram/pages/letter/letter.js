const {
  store,
  guard,
  theme,
  toast,
  view,
  confirm,
} = require("../../lib/runtime");
const tones = [
  { id: "gentle", name: "温柔倾听" },
  { id: "humorous", name: "轻松幽默" },
  { id: "direct", name: "清醒直言" },
  { id: "poetic", name: "诗意来信" },
  { id: "practical", name: "简洁建议" },
];
const modes = [
  { id: "reply", name: "笔友回信" },
  { id: "summary", name: "阶段回顾" },
  { id: "parallel", name: "平行时空" },
  { id: "question", name: "明日一问" },
  { id: "dual", name: "AI 双声道" },
];
function normalizeReply(data, mode, tone, snapshots) {
  if (
    !data ||
    typeof data.reply !== "string" ||
    !data.reply.trim() ||
    data.reply.length > 6000 ||
    typeof data.title !== "string" ||
    data.title.length > 80 ||
    !Array.isArray(data.tags) ||
    data.tags.length > 5 ||
    data.tags.some(
      (t) => typeof t !== "string" || !t.trim() || t.length > 20,
    ) ||
    !/^#[0-9a-f]{6}$/i.test(data.color) ||
    typeof data.colorName !== "string" ||
    data.colorName.length > 20 ||
    (mode === "dual" &&
      (typeof data.alternateReply !== "string" ||
        !data.alternateReply.trim() ||
        data.alternateReply.length > 6000))
  )
    throw Error("回信格式不正确，请重试");
  return {
    reply: data.reply,
    title: data.title,
    tags: data.tags,
    color: data.color,
    colorName: data.colorName,
    question: mode === "question" ? data.reply : "",
    alternateReply: mode === "dual" ? data.alternateReply : "",
    mode,
    tone,
    version: snapshots[0].version,
    sources: snapshots,
  };
}
Page({
  data: {
    tones,
    modes,
    tone: "gentle",
    mode: "reply",
    selected: [],
    loading: false,
    confirming: false,
    reply: null,
    error: "",
    history: [],
    showHistory: false,
    canApply: false,
  },
  onLoad(o) {
    this.entryId = o.id || "";
    this.initialMode = modes.some((m) => m.id === o.mode) ? o.mode : "reply";
  },
  onShow() {
    if (!guard()) return;
    try {
      const owner = store.active();
      if (this.owner && this.owner !== owner) {
        this.entryId = "";
        this.setData({ reply: null, error: "", canApply: false });
      }
      this.owner = owner;
      const all = store.list().map(view);
      const entry = this.entryId ? store.get(this.entryId) : null;
      const selected = entry ? [entry.id] : [];
      this.setData({
        theme: theme(),
        entries: all.map((e) => ({ ...e, checked: selected.includes(e.id) })),
        tone:
          store.account().settings.tone === "humor"
            ? "humorous"
            : store.account().settings.tone,
        selected,
        mode: this.initialMode,
        entryId: this.entryId,
      });
      this.refreshHistory();
    } catch (e) {
      this.setData({
        entries: [],
        selected: [],
        history: [],
        reply: null,
        error: e.message,
      });
    }
  },
  refreshHistory() {
    const records = store.list();
    const history = [];
    records.forEach((entry) =>
      entry.replies.forEach((reply) => {
        const sources = reply.sources || [
          { id: entry.id, version: reply.version },
        ];
        if (!sources.every((s) => records.some((e) => e.id === s.id))) return;
        if (this.entryId && !sources.some((s) => s.id === this.entryId)) return;
        history.push({
          ...reply,
          id: entry.id + "-" + reply.at,
          entryId: entry.id,
          sources,
          toneLabel:
            (
              tones.find(
                (t) =>
                  t.id === (reply.tone === "humor" ? "humorous" : reply.tone),
              ) || {}
            ).name || "笔友",
          modeLabel:
            (
              modes.find(
                (m) =>
                  m.id === (reply.mode === "letter" ? "reply" : reply.mode),
              ) || {}
            ).name || "回信",
          dateLabel: new Date(reply.at).toLocaleString(),
        });
      }),
    );
    this.setData({ history: history.sort((a, b) => b.at - a.at).slice(0, 40) });
  },
  onHide() {
    this.cancel();
  },
  onUnload() {
    this.cancel();
  },
  tone(e) {
    if (!this.data.loading && !this.data.confirming)
      this.setData({ tone: e.currentTarget.dataset.id });
  },
  mode(e) {
    if (!this.data.loading && !this.data.confirming)
      this.setData({
        mode: e.currentTarget.dataset.id,
        reply: null,
        error: "",
        applied: false,
        canApply: false,
      });
  },
  select(e) {
    if (this.data.loading || this.data.confirming) return;
    const id = e.currentTarget.dataset.id;
    const selected = this.data.selected.includes(id)
      ? this.data.selected.filter((x) => x !== id)
      : this.data.selected.concat(id);
    if (selected.length > 10) {
      toast("一次最多选择 10 篇记录");
      return;
    }
    this.setData({
      selected,
      entries: this.data.entries.map((x) => ({
        ...x,
        checked: selected.includes(x.id),
      })),
    });
  },
  saveTone() {
    try {
      store.settings({ tone: this.data.tone });
      toast("已设为默认语气");
    } catch (e) {
      toast(e);
    }
  },
  async generate() {
    if (this.data.loading || this.data.confirming) return;
    let entries, snapshots, url;
    const owner = store.active(),
      mode = this.data.mode,
      tone = this.data.tone;
    try {
      if (!this.data.selected.length) throw Error("请选择要寄出的记录");
      if (
        (mode === "reply" || mode === "parallel" || mode === "dual") &&
        this.data.selected.length !== 1
      )
        throw Error("笔友回信、平行时空与双声道请选择一篇记录");
      entries = this.data.selected.map((id) => store.get(id));
      snapshots = entries.map((e) => ({ id: e.id, version: e.updatedAt }));
      url = store.account().settings.proxy;
      if (!/^http:\/\/(127\.0\.0\.1|localhost):\d{2,5}$/.test(url))
        throw Error("请在我的页面设置有效的本机代理地址");
      if (
        entries.reduce((sum, e) => sum + e.title.length + e.body.length, 0) >
        18000
      )
        throw Error("本次正文超过 18000 字，请减少记录");
    } catch (e) {
      toast(e);
      return;
    }
    const token = (this.token || 0) + 1;
    this.token = token;
    this.setData({ confirming: true });
    const accepted = await confirm(
      "将选中的记录寄给 AI 笔友？",
      `本次仅发送 ${entries.length} 篇记录的标题、正文与日期，不发送照片、心情或标签。\n${entries.map((e) => e.title || "没有标题的一天").join("、")}\n${mode === "dual" ? "双声道会在一次请求中生成两封短回信，可能使用更多 token。\n" : ""}内容经本地代理送至你配置的 AI 服务，可能产生 API 费用。`,
    );
    if (this.token !== token) return;
    this.setData({ confirming: false });
    if (!accepted) return;
    try {
      if (
        owner !== store.active() ||
        snapshots.some((s) => store.get(s.id).updatedAt !== s.version)
      )
        throw Error("账户或记录已改变，请重新选择");
    } catch (e) {
      toast(e);
      return;
    }
    this.setData({
      loading: true,
      error: "",
      reply: null,
      applied: false,
      canApply: false,
    });
    this.request = wx.request({
      url: url + "/api/reply",
      method: "POST",
      timeout: 50000,
      header: { "content-type": "application/json" },
      data: {
        mode,
        tone,
        entries: entries.map(({ title, body, date }) => ({
          title,
          body,
          date,
        })),
      },
      success: (r) => {
        if (this.token !== token) return;
        try {
          if (r.statusCode !== 200)
            throw Error(
              r.data && typeof r.data.error === "string"
                ? r.data.error
                : "生成失败，请检查代理配置后重试",
            );
          if (
            owner !== store.active() ||
            snapshots.some((s) => store.get(s.id).updatedAt !== s.version)
          )
            throw Error("账户或记录已改变，这封回信未保存");
          const reply = normalizeReply(r.data, mode, tone, snapshots);
          store.addReply(owner, entries[0].id, snapshots[0].version, reply);
          this.resultEntry = entries[0].id;
          this.refreshHistory();
          this.setData({
            reply,
            canApply: entries.length === 1 && mode === "reply",
          });
        } catch (e) {
          this.setData({ error: e.message });
        }
      },
      fail: (e) => {
        if (this.token === token)
          this.setData({
            error: /timeout/.test(e.errMsg)
              ? "等候超时，内容仍在。可以稍后重新生成。"
              : "未能连接笔友。请确认本地代理已启动、密钥已配置，并检查开发者工具的网络设置。",
          });
      },
      complete: () => {
        if (this.token === token) {
          this.request = null;
          this.setData({ loading: false });
        }
      },
    });
  },
  cancel() {
    this.token = (this.token || 0) + 1;
    if (this.request) this.request.abort();
    this.request = null;
    if (this.data.loading || this.data.confirming)
      this.setData({
        loading: false,
        confirming: false,
        error: "已取消本次请求。",
      });
  },
  history(e) {
    try {
      const reply = this.data.history[Number(e.currentTarget.dataset.index)];
      reply.sources.forEach((s) => store.get(s.id));
      this.resultEntry = reply.entryId;
      this.setData({
        reply,
        showHistory: false,
        applied: false,
        canApply:
          reply.sources.length === 1 &&
          (reply.mode === "reply" || reply.mode === "letter"),
      });
    } catch (e) {
      toast(e);
    }
  },
  toggleHistory() {
    this.setData({ showHistory: !this.data.showHistory });
  },
  closeHistory() {
    this.setData({ showHistory: false });
  },
  async apply() {
    if (!this.resultEntry || !this.data.canApply) return;
    if (
      await confirm(
        "采纳这封回信的建议？",
        "将更新记录标题、合并建议标签并应用情绪色。原文字版本会被保留。",
      )
    ) {
      try {
        store.applySuggestions(this.resultEntry, this.data.reply);
        this.setData({ applied: true });
        toast("已采纳，可点击撤销建议恢复");
      } catch (e) {
        toast(e);
      }
    }
  },
  undo() {
    try {
      store.undoSuggestions(this.resultEntry);
      this.setData({ applied: false, canApply: false });
      toast("标题、标签和颜色已恢复");
    } catch (e) {
      toast(e);
    }
  },
  copy() {
    if (this.data.reply) wx.setClipboardData({ data: this.data.reply.reply });
  },
  writeQuestion() {
    if (this.data.reply)
      wx.navigateTo({
        url:
          "/pages/editor/editor?prompt=" +
          encodeURIComponent(this.data.reply.question + "\n\n"),
      });
  },
});
