const { store, guard, theme, toast, view } = require("../../lib/runtime");
const { privacyFindings } = require("../../lib/showcase");
Page({
  data: {
    layout: "journal",
    layouts: [
      { id: "journal", name: "手账" },
      { id: "polaroid", name: "拍立得" },
      { id: "letter", name: "笔友回信" },
    ],
    showDate: true,
    showName: false,
    showAI: false,
    generating: false,
    image: "",
    summary: "",
  },
  onLoad(o) {
    if (!guard()) return;
    try {
      const e = store.get(o.id);
      this.owner = store.active();
      this.id = e.id;
      this.setData({
        theme: theme(),
        entry: view(e),
        name: store.account().name,
        summary: e.body.slice(0, 220) + (e.body.length > 220 ? "…" : ""),
        ai: e.replies[0] ? e.replies[0].reply : "",
        privacy: privacyFindings(e.body),
        privacyText: privacyFindings(e.body).join("、"),
      });
    } catch (e) {
      toast(e);
      this.setData({ error: e.message });
    }
  },
  layout(e) {
    this.setData({ layout: e.currentTarget.dataset.id, image: "" });
  },
  toggle(e) {
    this.setData({ [e.currentTarget.dataset.key]: e.detail.value, image: "" });
  },
  summary(e) {
    const privacy = privacyFindings(e.detail.value);
    this.setData({
      summary: e.detail.value,
      image: "",
      privacy,
      privacyText: privacy.join("、"),
    });
  },
  async generate() {
    if (this.data.generating) return;
    try {
      if (store.active() !== this.owner) throw Error("账户已切换");
      store.get(this.id);
    } catch (e) {
      toast(e);
      return;
    }
    this.setData({ generating: true, error: "" });
    try {
      const d = this.data;
      const { canvas, ctx } = await this.canvasNode();
      const image = d.entry.photo
        ? await this.canvasImage(canvas, d.entry.photo)
        : null;
      ctx.textBaseline = "alphabetic";
      if (d.layout === "polaroid") this.drawPolaroid(ctx, image, d);
      else if (d.layout === "letter") this.drawLetter(ctx, image, d);
      else this.drawJournal(ctx, image, d);
      const result = await new Promise((resolve, reject) =>
        wx.canvasToTempFilePath(
          {
            canvas,
            width: 600,
            height: 900,
            destWidth: 1200,
            destHeight: 1800,
            success: resolve,
            fail: reject,
          },
          this,
        ),
      );
      this.setData({ image: result.tempFilePath });
    } catch (e) {
      this.setData({ error: "卡片生成失败，请稍后重试。" });
      toast(e);
    } finally {
      this.setData({ generating: false });
    }
  },
  drawJournal(ctx, image, d) {
    ctx.fillStyle = "#eee8dc";
    ctx.fillRect(0, 0, 600, 900);
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(24, 24, 552, 852);
    ctx.fillStyle = "#21745d";
    ctx.fillRect(24, 24, 552, 9);
    ctx.font = "17px sans-serif";
    ctx.fillText("SUMMER TRACES · 手账", 50, 68);
    let y = 94;
    if (image) {
      this.coverImage(ctx, image, 50, y, 500, 248);
      y += 282;
    } else {
      ctx.fillStyle = "#e5efe9";
      ctx.fillRect(50, y, 500, 112);
      ctx.fillStyle = "#487363";
      ctx.font = "18px sans-serif";
      ctx.fillText("今天的文字，也是一张照片", 78, y + 64);
      y += 146;
    }
    ctx.fillStyle = "#203d36";
    ctx.font = "30px sans-serif";
    y = this.lines(ctx, d.entry.displayTitle, 50, y, 500, 40, 2);
    if (d.showDate) {
      ctx.fillStyle = "#61736d";
      ctx.font = "17px sans-serif";
      ctx.fillText(d.entry.dateLabel + " · " + d.entry.mood, 50, y + 18);
      y += 48;
    }
    ctx.fillStyle = "#d6e4dc";
    ctx.fillRect(50, y, 72, 4);
    ctx.fillStyle = "#203d36";
    ctx.font = "21px sans-serif";
    this.lines(ctx, d.summary, 50, y + 38, 500, 33, Math.max(2, Math.floor((785 - y) / 33)));
    this.drawFooter(ctx, d, "把日常贴进一页手账");
  },
  drawPolaroid(ctx, image, d) {
    ctx.fillStyle = "#bfd2c9";
    ctx.fillRect(0, 0, 600, 900);
    ctx.fillStyle = "#285448";
    ctx.fillRect(0, 760, 600, 140);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(48, 42, 504, 748);
    if (image) this.coverImage(ctx, image, 78, 72, 444, 500);
    else {
      ctx.fillStyle = "#dce9e3";
      ctx.fillRect(78, 72, 444, 500);
      ctx.fillStyle = "#447362";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("这一刻没有照片", 300, 310);
      ctx.font = "17px sans-serif";
      ctx.fillText("于是把文字留在相纸上", 300, 344);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "#203d36";
    ctx.font = "29px sans-serif";
    this.lines(ctx, d.entry.displayTitle, 82, 626, 436, 38, 2);
    if (d.showDate) {
      ctx.fillStyle = "#61736d";
      ctx.font = "16px sans-serif";
      ctx.fillText(d.entry.dateLabel + " · " + d.entry.mood, 82, 715);
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.fillText(
      d.showName ? d.name + " · 夏日有迹" : "夏日有迹 · 一张生活拍立得",
      48,
      842,
    );
  },
  drawLetter(ctx, image, d) {
    ctx.fillStyle = "#e6ddd0";
    ctx.fillRect(0, 0, 600, 900);
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(34, 30, 532, 840);
    ctx.fillStyle = "#d5e3dc";
    for (let y = 178; y < 810; y += 42) ctx.fillRect(58, y, 484, 1);
    ctx.strokeStyle = "#d86b58";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(498, 94, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#d86b58";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("夏日", 498, 91);
    ctx.fillText("回信", 498, 110);
    ctx.textAlign = "left";
    ctx.fillStyle = "#21745d";
    ctx.font = "17px sans-serif";
    ctx.fillText("TO：正在认真生活的你", 60, 86);
    ctx.fillStyle = "#203d36";
    ctx.font = "29px sans-serif";
    let y = this.lines(ctx, d.entry.displayTitle, 60, 140, 390, 38, 2);
    if (d.showDate) {
      ctx.fillStyle = "#61736d";
      ctx.font = "16px sans-serif";
      ctx.fillText(d.entry.dateLabel + " · " + d.entry.mood, 60, y + 16);
      y += 54;
    } else y += 18;
    if (image) {
      this.coverImage(ctx, image, 382, y, 150, 118);
    }
    ctx.fillStyle = "#203d36";
    ctx.font = "21px sans-serif";
    const body = d.showAI && d.ai ? d.ai : d.summary;
    this.lines(ctx, body, 60, y + 30, image ? 302 : 472, 42, 13);
    ctx.fillStyle = "#61736d";
    ctx.font = "16px sans-serif";
    ctx.fillText(
      d.showName ? "FROM：" + d.name : "FROM：夏日有迹",
      60,
      832,
    );
  },
  drawFooter(ctx, d, fallback) {
    ctx.fillStyle = "#61736d";
    ctx.font = "16px sans-serif";
    ctx.fillText(d.showName ? d.name + " · 夏日有迹" : "夏日有迹 · " + fallback, 50, 844);
  },
  coverImage(ctx, image, x, y, width, height) {
    const sourceWidth = image.width || width;
    const sourceHeight = image.height || height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    const sourceX = Math.max(0, (sourceWidth - cropWidth) / 2);
    const sourceY = Math.max(0, (sourceHeight - cropHeight) / 2);
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      x,
      y,
      width,
      height,
    );
  },
  canvasNode() {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .in(this)
        .select("#shareCanvas")
        .fields({ node: true, size: true })
        .exec((result) => {
          const value = result && result[0];
          if (!value || !value.node) return reject(Error("画布尚未准备好"));
          const ratio = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : 2;
          value.node.width = 600 * ratio;
          value.node.height = 900 * ratio;
          const ctx = value.node.getContext("2d");
          ctx.scale(ratio, ratio);
          resolve({ canvas: value.node, ctx });
        });
    });
  },
  canvasImage(canvas, src) {
    return new Promise((resolve) => {
      const image = canvas.createImage();
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      };
      const timer = setTimeout(() => finish(null), 2500);
      image.onload = () => finish(image);
      image.onerror = () => finish(null);
      image.src = src;
    });
  },
  lines(ctx, text, x, y, width, lineHeight, maxLines) {
    let line = "",
      lines = [];
    for (const char of text) {
      if (char === "\n" || ctx.measureText(line + char).width > width) {
        lines.push(line);
        line = char === "\n" ? "" : char;
      } else line += char;
    }
    if (line) lines.push(line);
    const clipped = lines.slice(0, maxLines);
    if (lines.length > maxLines)
      clipped[clipped.length - 1] =
        clipped[clipped.length - 1].slice(0, -1) + "…";
    clipped.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return y + clipped.length * lineHeight;
  },
  async save() {
    if (!this.data.image) await this.generate();
    if (!this.data.image) return;
    wx.saveImageToPhotosAlbum({
      filePath: this.data.image,
      success: () => {
        try {
          store.track("card");
          toast("纪念卡已保存");
        } catch (e) {
          toast(e);
        }
      },
      fail: (e) => {
        if (/auth|deny|denied/.test(e.errMsg))
          wx.showModal({
            title: "需要相册权限",
            content: "允许访问相册后，可以保存这张纪念卡。",
            confirmText: "打开设置",
            success: (r) => {
              if (r.confirm) wx.openSetting();
            },
          });
        else toast("保存未完成，可长按预览图片重试");
      },
    });
  },
  copy() {
    wx.setClipboardData({
      data: [
        this.data.entry.displayTitle,
        this.data.showDate ? this.data.entry.dateLabel : "",
        this.data.summary,
        this.data.showAI ? this.data.ai : "",
        this.data.showName ? this.data.name : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  },
  preview() {
    if (this.data.image) wx.previewImage({ urls: [this.data.image] });
  },
});
