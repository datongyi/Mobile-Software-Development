const common = require('../../utils/common.js')
const favorites = require('../../utils/favorites.js')
const newsState = require('../../utils/news-state.js')
const authSession = require('../../utils/auth-session.js')
const app = getApp()

Page({
  data: {
    isLogin: false, avatarUrl: '', nickName: '', pendingAvatarUrl: '', pendingNickName: '',
    activeSection: 'favorites', sortDirection: 'latest', displayList: [], theme: 'light',
    stats: { favorites: 0, likes: 0, comments: 0, reads: 0 }
  },

  onShow() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('campusNewsUser')
    const isLogin = authSession.isValidUser(userInfo)
    this.setData({
      isLogin,
      avatarUrl: isLogin ? userInfo.avatarUrl : '',
      nickName: isLogin ? userInfo.nickName : '',
      activeSection: wx.getStorageSync('myActiveSection') || this.data.activeSection,
      theme: wx.getStorageSync('campusNewsTheme') === 'dark' ? 'dark' : 'light'
    })
    this.refreshData()
  },

  chooseAvatar(event) { this.setData({ pendingAvatarUrl: event.detail.avatarUrl }) },
  inputNickname(event) { this.setData({ pendingNickName: event.detail.value.trim() }) },

  login() {
    const userInfo = { profileVersion: 2, avatarUrl: this.data.pendingAvatarUrl, nickName: this.data.pendingNickName }
    if (!userInfo.avatarUrl || !userInfo.nickName) {
      wx.showToast({ title: '请选择头像并填写昵称', icon: 'none' }); return
    }
    app.globalData.userInfo = userInfo
    wx.setStorageSync('campusNewsUser', userInfo)
    this.setData({ isLogin: true, avatarUrl: userInfo.avatarUrl, nickName: userInfo.nickName })
    this.refreshData()
  },

  clearAccount() {
    authSession.logout({
      app,
      removeStorage: (key) => wx.removeStorageSync(key)
    })
    this.setData({
      isLogin: false,
      avatarUrl: '',
      nickName: '',
      pendingAvatarUrl: '',
      pendingNickName: '',
      displayList: []
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后将保留收藏、点赞、历史和主题设置，确定退出吗？',
      success: (result) => {
        if (result.confirm) this.clearAccount()
      }
    })
  },

  chooseSection(event) {
    const activeSection = event.currentTarget.dataset.section
    wx.setStorageSync('myActiveSection', activeSection)
    this.setData({ activeSection }); this.refreshData()
  },
  toggleSort() { this.setData({ sortDirection: this.data.sortDirection === 'latest' ? 'earliest' : 'latest' }); this.refreshData() },
  toggleTheme() {
    const theme = this.data.theme === 'dark' ? 'light' : 'dark'
    wx.setStorageSync('campusNewsTheme', theme); app.globalData.theme = theme; this.setData({ theme })
  },

  refreshData() {
    const favoriteList = favorites.normalizeFavorites(wx.getStorageSync('favoriteNews'))
    const likedIds = newsState.normalizeLikedIds(wx.getStorageSync('likedNewsIds'))
    const storedHistory = wx.getStorageSync('readingHistory')
    const history = Array.isArray(storedHistory) ? storedHistory : []
    const allNews = common.getNewsList()
    const commentsByNews = allNews.map(item => {
      const value = wx.getStorageSync(`newsComments_${item.id}`); return Array.isArray(value) ? value : []
    })
    let displayList = []
    if (this.data.isLogin) {
      if (this.data.activeSection === 'history') displayList = history
      else if (this.data.activeSection === 'likes') displayList = newsState.getNewsByIds(allNews, likedIds)
      else displayList = newsState.sortFavorites(favoriteList, this.data.sortDirection)
    }
    this.setData({ displayList, stats: newsState.buildStats({ favorites: favoriteList, likedIds, commentsByNews, history }) })
  },

  removeFavorite(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({ title: '删除收藏', content: '确定从收藏夹移除这条新闻吗？', success: result => {
      if (!result.confirm) return
      wx.setStorageSync('favoriteNews', favorites.removeFavorite(wx.getStorageSync('favoriteNews'), id)); this.refreshData()
    } })
  },
  goToDetail(event) { wx.navigateTo({ url: `../detail/detail?id=${event.currentTarget.dataset.id}` }) }
})
