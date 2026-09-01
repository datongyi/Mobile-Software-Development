function normalizeFavorites(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(item => (
    item &&
    item.id &&
    item.title &&
    item.poster &&
    item.content &&
    item.add_date
  ))
}

function isFavorite(list, newsId) {
  return normalizeFavorites(list).some(item => item.id === newsId)
}

function addFavorite(list, article) {
  const normalized = normalizeFavorites(list)
  if (!article || !article.id) {
    return normalized
  }

  const favorite = Object.assign({}, article, {
    favoritedAt: article.favoritedAt || Date.now()
  })
  return normalized.filter(item => item.id !== article.id).concat(favorite)
}

function removeFavorite(list, newsId) {
  return normalizeFavorites(list).filter(item => item.id !== newsId)
}

module.exports = {
  normalizeFavorites,
  isFavorite,
  addFavorite,
  removeFavorite
}
