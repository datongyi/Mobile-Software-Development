function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function filterNews(list, category, keyword) {
  if (category && typeof category === 'object') {
    keyword = category.keyword
    category = category.category
  }
  const normalizedKeyword = String(keyword || '').trim().toLowerCase()
  return normalizeArray(list).filter(item => {
    const categoryMatched = !category || category === '全部' || item.category === category
    const keywordMatched = !normalizedKeyword || String(item.title || '').toLowerCase().includes(normalizedKeyword)
    return categoryMatched && keywordMatched
  })
}

function toggleLike(list, newsId) {
  const ids = normalizeArray(list).filter(Boolean)
  return ids.includes(newsId) ? ids.filter(id => id !== newsId) : ids.concat(newsId)
}

function normalizeLikedIds(value) {
  return Array.from(new Set(normalizeArray(value).filter(id => typeof id === 'string' && id)))
}

function isLiked(list, newsId) {
  return normalizeLikedIds(list).includes(newsId)
}

function recordHistory(list, article, viewedAt) {
  if (!article || !article.id) {
    return normalizeArray(list)
  }
  const entry = Object.assign({}, article, { viewedAt: viewedAt || Date.now() })
  return [entry].concat(normalizeArray(list).filter(item => item && item.id !== article.id)).slice(0, 30)
}

function incrementViewCount(value, newsId) {
  const counts = value && typeof value === 'object' && !Array.isArray(value) ? Object.assign({}, value) : {}
  counts[newsId] = Number(counts[newsId] || 0) + 1
  return counts
}

function sortFavorites(list, direction) {
  const result = normalizeArray(list).slice()
  const factor = direction === 'earliest' ? 1 : -1
  return result.sort((a, b) => (Number(a.favoritedAt || 0) - Number(b.favoritedAt || 0)) * factor)
}

function buildStats(input) {
  const data = input || {}
  const comments = normalizeArray(data.commentsByNews).reduce((total, list) => total + normalizeArray(list).length, 0)
  return {
    favorites: normalizeArray(data.favorites).length,
    likes: normalizeArray(data.likedIds).length,
    comments,
    reads: normalizeArray(data.history).length
  }
}

function getNewsByIds(newsList, ids) {
  const idSet = new Set(normalizeArray(ids))
  return normalizeArray(newsList).filter(item => item && idSet.has(item.id))
}

module.exports = {
  filterNews,
  normalizeLikedIds,
  isLiked,
  toggleLike,
  recordHistory,
  incrementViewCount,
  sortFavorites,
  buildStats,
  getNewsByIds
}
