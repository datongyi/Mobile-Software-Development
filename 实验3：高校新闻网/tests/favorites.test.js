const assert = require('node:assert/strict')
const favorites = require('../utils/favorites.js')

const first = {
  id: '264698',
  title: '新闻一',
  poster: '/images/newsimage1.jpg',
  content: '正文一',
  add_date: '2022-08-19',
  favoritedAt: 100
}
const updatedFirst = { ...first, title: '更新后的新闻一' }
const second = {
  id: '304083',
  title: '新闻二',
  poster: '/images/newsimage2.jpg',
  content: '正文二',
  add_date: '2022-08-09',
  favoritedAt: 200
}

assert.deepEqual(favorites.normalizeFavorites(null), [])
assert.deepEqual(favorites.normalizeFavorites([null, {}, first]), [first])
assert.deepEqual(favorites.normalizeFavorites([{ id: 'broken' }]), [])

let list = favorites.addFavorite([], first)
assert.deepEqual(list, [first])

list = favorites.addFavorite(list, updatedFirst)
assert.deepEqual(list, [updatedFirst])

list = favorites.addFavorite(list, second)
assert.equal(favorites.isFavorite(list, second.id), true)
assert.equal(favorites.isFavorite(list, 'missing'), false)

list = favorites.removeFavorite(list, first.id)
assert.deepEqual(list, [second])

console.log('favorites tests passed')
