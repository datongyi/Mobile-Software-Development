const common = require('../../utils/common.js')
const newsState = require('../../utils/news-state.js')

const HISTORY_KEY = 'readingHistory'
const VIEW_COUNTS_KEY = 'newsViewCounts'
const THEME_KEY = 'campusNewsTheme'
const ACTIVE_SECTION_KEY = 'myActiveSection'

Page({
  data: {
    swiperImg: [{ src: '/images/newsimage1.jpg' }, { src: '/images/newsimage2.jpg' }, { src: '/images/newsimage3.jpg' }],
    categories: ['全部', '学校要闻', '学术动态', '学生活动'],
    activeCategory: '全部',
    keyword: '',
    newsList: [],
    filteredNews: [],
    isLoading: true,
    theme: 'light'
  },
  onLoad() { this.loadNews() },
  onShow() { this.setData({ theme: wx.getStorageSync(THEME_KEY) === 'dark' ? 'dark' : 'light' }) },
  loadNews() {
    const newsList = common.getNewsList()
    this.setData({ newsList, isLoading: false })
    this.applyFilters()
  },
  applyFilters() {
    const { newsList, activeCategory, keyword } = this.data
    this.setData({ filteredNews: newsState.filterNews(newsList, { category: activeCategory === '全部' ? '' : activeCategory, keyword }) })
  },
  onSearchInput(event) { this.setData({ keyword: event.detail.value }); this.applyFilters() },
  chooseCategory(event) { this.setData({ activeCategory: event.currentTarget.dataset.category }); this.applyFilters() },
  openMySection(event) {
    wx.setStorageSync(ACTIVE_SECTION_KEY, event.currentTarget.dataset.section)
    wx.switchTab({ url: '/pages/my/my' })
  },
  goToDetail(event) {
    const id = event.currentTarget.dataset.id
    const article = this.data.newsList.find((item) => item.id === id)
    if (article) {
      const history = wx.getStorageSync(HISTORY_KEY)
      const counts = wx.getStorageSync(VIEW_COUNTS_KEY)
      wx.setStorageSync(HISTORY_KEY, newsState.recordHistory(Array.isArray(history) ? history : [], article, Date.now()))
      wx.setStorageSync(VIEW_COUNTS_KEY, newsState.incrementViewCount(counts && typeof counts === 'object' ? counts : {}, id))
    }
    wx.navigateTo({ url: `../detail/detail?id=${id}` })
  },
  onPullDownRefresh() { this.setData({ isLoading: true }); this.loadNews(); wx.stopPullDownRefresh() }
})
