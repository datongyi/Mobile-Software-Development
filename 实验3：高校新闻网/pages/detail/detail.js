const common = require('../../utils/common.js')
const favorites = require('../../utils/favorites.js')
const newsState = require('../../utils/news-state.js')
const comments = require('../../utils/comments.js')
const authSession = require('../../utils/auth-session.js')

function formatCommentTime(now) {
  const date = new Date(now)
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page({
  data: {
    article: {},
    isFavorite: false,
    isLiked: false,
    viewCount: 0,
    comments: [],
    commentContent: '',
    theme: 'light',
    isLogin: false
  },

  onLoad(options) {
    const result = common.getNewsDetail(options.id)
    if (result.code !== '200') {
      wx.showToast({ title: '新闻不存在', icon: 'none' })
      return
    }

    this.setData({ article: result.news })
    wx.setNavigationBarTitle({ title: '新闻详情' })
    this.syncInteractionState()
  },

  onShow() {
    if (this.data.article.id) {
      this.syncInteractionState()
    }
  },

  syncInteractionState() {
    const newsId = this.data.article.id
    const favoriteList = favorites.normalizeFavorites(wx.getStorageSync('favoriteNews'))
    const likedIds = newsState.normalizeLikedIds(wx.getStorageSync('likedNewsIds'))
    const viewCounts = wx.getStorageSync('newsViewCounts') || {}
    const commentList = comments.normalizeComments(wx.getStorageSync(`newsComments_${newsId}`))
    const theme = wx.getStorageSync('campusNewsTheme') === 'dark' ? 'dark' : 'light'
    const userInfo = getApp().globalData.userInfo || wx.getStorageSync('campusNewsUser')

    this.setData({
      isFavorite: favorites.isFavorite(favoriteList, newsId),
      isLiked: newsState.isLiked(likedIds, newsId),
      viewCount: Number(viewCounts[newsId]) || 0,
      comments: commentList,
      theme,
      isLogin: authSession.isValidUser(userInfo)
    })
  },

  addFavorite() {
    const list = favorites.addFavorite(wx.getStorageSync('favoriteNews'), this.data.article)
    wx.setStorageSync('favoriteNews', list)
    this.setData({ isFavorite: true })
    wx.showToast({ title: '收藏成功' })
  },

  cancelFavorite() {
    const list = favorites.removeFavorite(wx.getStorageSync('favoriteNews'), this.data.article.id)
    wx.setStorageSync('favoriteNews', list)
    this.setData({ isFavorite: false })
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  },

  toggleLike() {
    const newsId = this.data.article.id
    const likedIds = newsState.toggleLike(
      newsState.normalizeLikedIds(wx.getStorageSync('likedNewsIds')),
      newsId
    )
    const isLiked = newsState.isLiked(likedIds, newsId)
    wx.setStorageSync('likedNewsIds', likedIds)
    this.setData({ isLiked })
    wx.showToast({ title: isLiked ? '点赞成功' : '已取消点赞', icon: 'none' })
  },

  inputComment(event) {
    this.setData({ commentContent: event.detail.value })
  },

  submitComment() {
    const userInfo = getApp().globalData.userInfo || wx.getStorageSync('campusNewsUser')
    if (!authSession.isValidUser(userInfo)) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const now = Date.now()
    const item = comments.createComment({
      content: this.data.commentContent,
      userInfo,
      now,
      createdText: formatCommentTime(now)
    })

    if (!item) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    const list = comments.addComment(this.data.comments, item)
    wx.setStorageSync(`newsComments_${this.data.article.id}`, list)
    this.setData({ comments: list, commentContent: '' })
    wx.showToast({ title: '评论成功' })
  },

  goToLogin() {
    wx.switchTab({ url: '/pages/my/my' })
  },

  deleteComment(event) {
    const commentId = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除评论',
      content: '确定删除这条评论吗？',
      confirmText: '删除',
      confirmColor: '#e34d59',
      success: result => {
        if (!result.confirm) {
          return
        }
        const list = comments.removeComment(this.data.comments, commentId)
        wx.setStorageSync(`newsComments_${this.data.article.id}`, list)
        this.setData({ comments: list })
        wx.showToast({ title: '评论已删除', icon: 'none' })
      }
    })
  },

  backToTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 })
  },

  simulateShare() {
    wx.navigateTo({ url: `/pages/share/share?id=${this.data.article.id}` })
  },

  onShareAppMessage() {
    const article = this.data.article
    return {
      title: article.title || '高校新闻网',
      path: `/pages/detail/detail?id=${article.id}`,
      imageUrl: article.poster || ''
    }
  }
})
