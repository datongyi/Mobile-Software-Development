const { store, guard, theme, toast, view } = require("../../lib/runtime");
const { wordCloud, graph, palette, mosaic } = require("../../lib/showcase");

const FEATURES = [
  { id: "mosaic", name: "生活拼图" },
  { id: "cloud", name: "年度词云" },
  { id: "graph", name: "关系网" },
  { id: "palette", name: "情绪色谱" },
  { id: "exhibit", name: "我的展览" },
];

Page({
  data: {
    features: FEATURES,
    feature: "mosaic",
    scope: 31,
    entries: [],
    selected: [],
    exhibitIndex: 0,
    image: "",
    generating: false,
  },
  onShow() {
    if (!guard()) return;
    try {
      this.owner = store.active();
      const entries = store.list();
      const year = String(new Date().getFullYear());
      const selected = entries
        .slice(0, Math.min(3, entries.length))
        .map((e) => e.id);
      const graphData = graph(entries);
      const graphView = {
        ...graphData,
        edges: graphData.edges.map((edge) => ({
          ...edge,
          fromId: graphData.nodes[edge.from].id,
          fromTitle: graphData.nodes[edge.from].title,
          toId: graphData.nodes[edge.to].id,
          toTitle: graphData.nodes[edge.to].title,
          commonLabel: edge.common.join("、"),
        })),
      };
      this.rawEntries = entries;
      this.graphData = graphData;
      this.setData({
        theme: theme(),
        entries: entries.map((e) => ({
          ...view(e),
          checked: selected.includes(e.id),
        })),
        selected,
        words: wordCloud(entries.filter((e) => e.date.startsWith(year))),
        palette: palette(entries),
        graph: graphView,
        year,
      });
      this.refreshMosaic();
      this.refreshExhibit();
    } catch (e) {
      toast(e);
    }
  },
  feature(e) {
    const feature = e.currentTarget.dataset.id;
    this.setData({ feature, image: "" });
    if (feature === "graph") setTimeout(() => this.drawGraph(), 50);
  },
  scope(e) {
    this.setData({ scope: Number(e.currentTarget.dataset.days), image: "" });
    this.refreshMosaic();
  },
  refreshMosaic() {
    const since = new Date();
    since.setDate(since.getDate() - this.data.scope + 1);
    const key = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, "0")}-${String(since.getDate()).padStart(2, "0")}`;
    this.setData({
      mosaic: mosaic((this.rawEntries || []).filter((e) => e.date >= key)).map(
        (item) => ({ ...item, shortDate: item.date.slice(5) }),
      ),
    });
  },
  canvasNode(id, width, height) {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .in(this)
        .select(id)
        .fields({ node: true, size: true })
        .exec((result) => {
          const value = result && result[0];
          if (!value || !value.node) return reject(Error("画布尚未准备好"));
          const ratio = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2;
          value.node.width = width * ratio;
          value.node.height = height * ratio;
          const ctx = value.node.getContext("2d");
          ctx.scale(ratio, ratio);
          resolve({ canvas: value.node, ctx });
        });
    });
  },
  canvasImage(canvas, src) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), 2500);
      const image = canvas.createImage();
      image.onload = () => finish(image);
      image.onerror = () => finish(null);
      image.src = src;
    });
  },
  exportCanvas(canvas, width, height) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        handler(value);
      };
      const timer = setTimeout(
        () => finish(reject, Error("画布导出超时")),
        5000,
      );
      wx.canvasToTempFilePath(
        {
          canvas,
          width,
          height,
          destWidth: width * 2,
          destHeight: height * 2,
          success: (result) => finish(resolve, result),
          fail: (error) => finish(reject, error),
        },
        this,
      );
    });
  },
  async generateMosaic() {
    if (this.data.generating || !this.data.mosaic.length) return;
    this.setData({ generating: true, image: "" });
    try {
      const { canvas, ctx } = await this.canvasNode("#mosaicCanvas", 600, 700);
      ctx.fillStyle = "#F5F8F6";
      ctx.fillRect(0, 0, 600, 700);
      ctx.fillStyle = "#203D36";
      ctx.font = "30px sans-serif";
      ctx.fillText(
        this.data.scope === 7 ? "这一周的生活拼图" : "这个月的生活拼图",
        30,
        48,
      );
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#61736D";
      ctx.fillText("SUMMER TRACES · 夏日有迹", 30, 78);
      for (let i = 0; i < 9; i++) {
        const item = this.data.mosaic[i];
        const x = 30 + (i % 3) * 182;
        const y = 110 + Math.floor(i / 3) * 182;
        ctx.fillStyle = ["#DCEEE5", "#F7E3D8", "#E3EAF0"][i % 3];
        ctx.fillRect(x, y, 170, 170);
        if (!item) continue;
        const image = item.photo
          ? await this.canvasImage(canvas, item.photo)
          : null;
        if (image) ctx.drawImage(image, x, y, 170, 170);
        else {
          ctx.fillStyle = "#203D36";
          ctx.font = "18px sans-serif";
          ctx.fillText(item.title.slice(0, 8), x + 14, y + 78);
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#61736D";
          ctx.fillText(item.date.slice(5).replace("-", "/"), x + 14, y + 108);
        }
      }
      ctx.fillStyle = "#61736D";
      ctx.font = "15px sans-serif";
      ctx.fillText(`${this.data.mosaic.length} 个瞬间 · 只在本机生成`, 30, 675);
      const result = await this.exportCanvas(canvas, 600, 700);
      this.setData({ image: result.tempFilePath });
    } catch (e) {
      this.setData({ error: e.message || "拼图生成失败，请稍后重试" });
      toast(e.message || "拼图生成失败，请稍后重试");
    } finally {
      this.setData({ generating: false });
    }
  },
  drawGraph() {
    if (!this.graphData || !this.graphData.nodes.length) return;
    const ctx = wx.createCanvasContext("graphCanvas", this);
    const nodes = this.graphData.nodes;
    const cx = 175,
      cy = 145,
      radius = nodes.length > 8 ? 112 : 102;
    const positions = nodes.map((_, i) => ({
      x: cx + Math.cos((Math.PI * 2 * i) / nodes.length - Math.PI / 2) * radius,
      y: cy + Math.sin((Math.PI * 2 * i) / nodes.length - Math.PI / 2) * radius,
    }));
    ctx.setFillStyle("#F9FBFA");
    ctx.fillRect(0, 0, 350, 300);
    this.graphData.edges.forEach((edge) => {
      ctx.setStrokeStyle(edge.score > 0.45 ? "#D86B58" : "#B8CEC3");
      ctx.setLineWidth(1 + edge.score * 4);
      ctx.beginPath();
      ctx.moveTo(positions[edge.from].x, positions[edge.from].y);
      ctx.lineTo(positions[edge.to].x, positions[edge.to].y);
      ctx.stroke();
    });
    nodes.forEach((node, index) => {
      const p = positions[index];
      ctx.setFillStyle(node.color);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.setFillStyle("#203D36");
      ctx.setFontSize(10);
      ctx.fillText(node.title.slice(0, 5), p.x - 22, p.y + 34);
    });
    ctx.draw();
  },
  open(e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
  select(e) {
    const id = e.currentTarget.dataset.id;
    let selected = this.data.selected.includes(id)
      ? this.data.selected.filter((value) => value !== id)
      : this.data.selected.concat(id);
    if (selected.length > 6) return toast("一次最多展出 6 篇记录");
    this.setData({
      selected,
      exhibitIndex: 0,
      image: "",
      entries: this.data.entries.map((entry) => ({
        ...entry,
        checked: selected.includes(entry.id),
      })),
    });
    this.refreshExhibit();
  },
  refreshExhibit() {
    const exhibit = (this.rawEntries || [])
      .filter((entry) => this.data.selected.includes(entry.id))
      .map(view);
    this.setData({
      exhibit,
      exhibitIndex: Math.min(
        this.data.exhibitIndex,
        Math.max(0, exhibit.length - 1),
      ),
    });
  },
  exhibitStep(e) {
    const length = this.data.exhibit.length;
    if (!length) return;
    this.setData({
      exhibitIndex:
        (this.data.exhibitIndex +
          Number(e.currentTarget.dataset.step) +
          length) %
        length,
    });
  },
  async generateExhibit() {
    if (this.data.selected.length < 3)
      return toast("至少选择 3 篇记录组成展览");
    this.setData({ generating: true, image: "" });
    try {
      const { canvas, ctx } = await this.canvasNode("#exhibitCanvas", 600, 900);
      ctx.fillStyle = "#203D36";
      ctx.fillRect(0, 0, 600, 900);
      ctx.fillStyle = "#F5F8F6";
      ctx.fillRect(24, 24, 552, 852);
      ctx.fillStyle = "#D86B58";
      ctx.fillRect(50, 65, 70, 6);
      ctx.fillStyle = "#203D36";
      ctx.font = "40px sans-serif";
      ctx.fillText("我的夏日展览", 50, 135);
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#61736D";
      ctx.fillText(
        `${store.account().name} · ${this.data.selected.length} 段生活切片`,
        50,
        175,
      );
      this.data.exhibit.forEach((entry, index) => {
        const y = 245 + index * 82;
        ctx.fillStyle =
          entry.color || ["#21745D", "#D86B58", "#7D91A8"][index % 3];
        ctx.fillRect(50, y - 22, 8, 48);
        ctx.fillStyle = "#203D36";
        ctx.font = "21px sans-serif";
        ctx.fillText(entry.displayTitle.slice(0, 18), 76, y);
        ctx.fillStyle = "#61736D";
        ctx.font = "14px sans-serif";
        ctx.fillText(entry.dateLabel + " · " + entry.mood, 76, y + 25);
      });
      ctx.fillStyle = "#61736D";
      ctx.font = "15px sans-serif";
      ctx.fillText("SUMMER TRACES · 把生活认真收藏", 50, 830);
      const result = await this.exportCanvas(canvas, 600, 900);
      this.setData({ image: result.tempFilePath });
    } catch (e) {
      this.setData({ error: e.message || "展览封面生成失败，请稍后重试" });
      toast(e.message || "展览封面生成失败，请稍后重试");
    } finally {
      this.setData({ generating: false });
    }
  },
  preview() {
    if (this.data.image) wx.previewImage({ urls: [this.data.image] });
  },
  save() {
    if (!this.data.image) return toast("请先生成图片");
    wx.saveImageToPhotosAlbum({
      filePath: this.data.image,
      success: () => toast("图片已保存"),
      fail: () => toast("保存未完成，请检查相册权限"),
    });
  },
});
