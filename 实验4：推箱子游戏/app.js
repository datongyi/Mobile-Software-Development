const { storage } = require('./utils/storage');

App({
  globalData: {
    progress: null
  },

  onLaunch() {
    this.globalData.progress = storage.loadProgress();
  }
})
