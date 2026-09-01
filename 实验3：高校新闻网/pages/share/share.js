const common = require('../../utils/common.js')

Page({
  data: {
    article: {}
  },

  onLoad(options) {
    const result = common.getNewsDetail(options.id)
    if (result.code !== '200') {
      wx.showToast({ title: '新闻不存在', icon: 'none' })
      wx.navigateBack()
      return
    }
    this.setData({ article: result.news })
  },

  cancelShare() {
    wx.navigateBack()
  },

  confirmShare() {
    wx.showModal({
      title: '分享完成',
      content: '已分享到朋友圈',
      showCancel: false,
      success: () => wx.navigateBack()
    })
  }
})
