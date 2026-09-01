App({
  onLaunch() {
    const userInfo = wx.getStorageSync('campusNewsUser')
    const theme = wx.getStorageSync('campusNewsTheme') || 'light'
    this.globalData.userInfo = userInfo || null
    this.globalData.theme = theme
  },
  globalData: {
    userInfo: null,
    theme: 'light'
  }
})
