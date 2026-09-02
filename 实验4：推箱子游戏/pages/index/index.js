const levelData = require('../../utils/levels');
const { storage } = require('../../utils/storage');

const levels = levelData.map((level) => ({ id: level.id }));

Page({
  data: {
    levels: [],
    completedCount: 0,
    totalCount: levels.length,
    soundEnabled: true
  },

  onShow() {
    const progress = storage.loadProgress();
    getApp().globalData.progress = progress;
    this.setData({
      levels: levels.map((level) => ({
        ...level,
        locked: level.id > progress.unlocked
      })),
      completedCount: Object.keys(progress.completed).length,
      soundEnabled: progress.settings.sound
    });
  },

  chooseLevel(event) {
    const levelId = event.currentTarget.dataset.level;
    const progress = storage.loadProgress();
    if (levelId > progress.unlocked) {
      wx.showToast({ title: '请先完成上一关', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/game/game?level=${levelId}`
    });
  },

  toggleSound(event) {
    const progress = storage.setSoundEnabled(event.detail.value);
    getApp().globalData.progress = progress;
    this.setData({ soundEnabled: progress.settings.sound });
  }
});
