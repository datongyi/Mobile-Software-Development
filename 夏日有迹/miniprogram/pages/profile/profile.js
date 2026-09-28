const {
  store,
  guard,
  theme,
  toast,
  confirm,
  seed,
} = require("../../lib/runtime");
const { dataHealth } = require("../../lib/showcase");
Page({
  data: {
    trashOpen: false,
    busy: false,
    themes: ["日间", "晨间", "夜间", "跟随时间"],
    themeKeys: ["day", "morning", "night", "auto"],
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
        account: a,
        trash: store.trash(),
        total: store.list().length,
        themeIndex: this.data.themeKeys.indexOf(a.settings.theme),
        proxy: a.settings.proxy,
        health: dataHealth(a),
        backupLabel: a.settings.lastBackupAt
          ? new Date(a.settings.lastBackupAt).toLocaleString()
          : "尚未备份",
      });
    } catch (e) {
      toast(e);
    }
  },
  avatar() {
    wx.showActionSheet({
      itemList: ["嫩芽", "阳光", "咖啡", "贝壳"],
      success: (r) => {
        try {
          store.avatar(["sprout", "sun", "coffee", "shell"][r.tapIndex]);
          this.refresh();
        } catch (e) {
          toast(e);
        }
      },
    });
  },
  accounts() {
    wx.navigateTo({ url: "/pages/accounts/accounts" });
  },
  async logout() {
    if (await confirm("退出当前账户？", "记录与草稿仍保留在本机。")) {
      try {
        store.logout();
        wx.navigateTo({ url: "/pages/accounts/accounts" });
      } catch (e) {
        toast(e);
      }
    }
  },
  setting(e) {
    try {
      store.settings({ [e.currentTarget.dataset.key]: e.detail.value });
      this.refresh();
    } catch (e) {
      toast(e);
    }
  },
  themeChange(e) {
    try {
      store.settings({ theme: this.data.themeKeys[e.detail.value] });
      this.refresh();
    } catch (e) {
      toast(e);
    }
  },
  proxyInput(e) {
    this.setData({ proxy: e.detail.value });
  },
  saveProxy() {
    try {
      const url = this.data.proxy.trim().replace(/\/$/, "");
      if (
        !/^https?:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)(:\d+)?$/.test(
          url,
        )
      )
        throw Error("请输入本地代理地址，例如 http://127.0.0.1:8787");
      store.settings({ proxy: url });
      toast("代理地址已保存");
    } catch (e) {
      toast(e);
    }
  },
  check() {
    this.setData({ connection: "检查中…" });
    wx.request({
      url: store.account().settings.proxy + "/health",
      timeout: 8000,
      success: (r) =>
        this.setData({
          connection:
            r.statusCode === 200
              ? r.data.configured === false
                ? `代理已连接，${r.data.providerLabel || "AI 服务"} 配置不完整${r.data.detail ? "：" + r.data.detail : ""}`
                : `代理已连接 · ${r.data.providerLabel || "AI 服务"}${r.data.model ? " · " + r.data.model : ""}`
              : "代理返回错误 " + r.statusCode,
        }),
      fail: () =>
        this.setData({ connection: "无法连接，请启动本地代理并检查网络设置" }),
    });
  },
  async exportData() {
    if (this.data.busy) return;
    this.setData({ busy: true });
    try {
      const path = await require("../../lib/backup").exportBackup();
      store.track("backup");
      store.settings({ lastBackupAt: Date.now() });
      this.setData({ backupPath: path });
      if (wx.shareFileMessage)
        wx.shareFileMessage({
          filePath: path,
          fail: () =>
            wx.showModal({
              title: "备份已生成",
              content: path,
              showCancel: false,
            }),
        });
      else
        wx.showModal({ title: "备份已生成", content: path, showCancel: false });
    } catch (e) {
      toast(e);
    } finally {
      this.setData({ busy: false });
    }
  },
  importData() {
    if (this.data.busy) return;
    wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: async (r) => {
        if (
          !(await confirm(
            "导入为新的本地账户？",
            "现有账户不会被覆盖。请只导入可信的夏日有迹备份。",
          ))
        )
          return;
        this.setData({ busy: true });
        try {
          await require("../../lib/backup").importBackup(r.tempFiles[0].path);
          this.refresh();
          toast("备份已恢复为新账户");
        } catch (e) {
          toast(e);
        } finally {
          this.setData({ busy: false });
        }
      },
      fail: (e) => {
        if (!/cancel/.test(e.errMsg)) toast("未能读取备份文件");
      },
    });
  },
  trash() {
    this.setData({ trashOpen: !this.data.trashOpen });
  },
  studio() {
    wx.navigateTo({ url: "/pages/studio/studio" });
  },
  restore(e) {
    try {
      store.restore(e.currentTarget.dataset.id);
      this.refresh();
    } catch (e) {
      toast(e);
    }
  },
  async purge(e) {
    if (await confirm("永久删除这篇记录？", "删除后无法恢复。")) {
      try {
        store.purge(e.currentTarget.dataset.id);
        this.refresh();
      } catch (e) {
        toast(e);
      }
    }
  },
  async resetDemo() {
    if (!this.data.account.demo) return;
    if (
      await confirm("重置演示数据？", "只重置当前演示空间，个人账户不受影响。")
    ) {
      try {
        const old = store.active();
        seed();
        store.removeAccount(old);
        this.refresh();
      } catch (e) {
        toast(e);
      }
    }
  },
  onShareAppMessage() {
    return {
      title: "夏日有迹 · 留住生活里的小小瞬间",
      path: "/pages/home/home",
    };
  },
});
