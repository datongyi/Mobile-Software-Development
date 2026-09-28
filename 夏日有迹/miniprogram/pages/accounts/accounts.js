const { store, seed, toast, confirm } = require("../../lib/runtime");
Page({
  data: { name: "", accounts: [] },
  onShow() {
    this.refresh();
  },
  refresh() {
    this.setData({ accounts: store.accounts(), active: store.active() });
  },
  input(e) {
    this.setData({ name: e.detail.value });
  },
  enter(e) {
    try {
      store.switch(e.currentTarget.dataset.id);
      wx.switchTab({ url: "/pages/home/home" });
    } catch (e) {
      toast(e);
    }
  },
  create() {
    try {
      store.create(this.data.name);
      wx.switchTab({ url: "/pages/home/home" });
    } catch (e) {
      toast(e);
    }
  },
  demo() {
    try {
      const a = store.accounts().find((a) => a.demo);
      if (a) store.switch(a.id);
      else seed();
      wx.switchTab({ url: "/pages/home/home" });
    } catch (e) {
      toast(e);
    }
  },
  async remove(e) {
    const id = e.currentTarget.dataset.id;
    if (
      await confirm(
        "删除本地账户？",
        "此账户的全部记录将从本机移除。请先导出需要保留的内容。",
      )
    ) {
      try {
        store.removeAccount(id);
        this.refresh();
      } catch (e) {
        toast(e);
      }
    }
  },
});
