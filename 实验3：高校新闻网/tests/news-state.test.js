const assert = require('node:assert/strict')
const state = require('../utils/news-state.js')

const news = [
  { id: '1', title: '校园科研成果', category: '学术动态', add_date: '2026-08-31' },
  { id: '2', title: '迎新活动举行', category: '学生活动', add_date: '2026-08-30' },
  { id: '3', title: '学校召开会议', category: '学校要闻', add_date: '2026-08-29' }
]

assert.deepEqual(state.filterNews(news, '全部', '校园').map(item => item.id), ['1'])
assert.deepEqual(state.filterNews(news, '学生活动', '').map(item => item.id), ['2'])
assert.deepEqual(state.toggleLike([], '1'), ['1'])
assert.deepEqual(state.toggleLike(['1'], '1'), [])
assert.deepEqual(state.normalizeLikedIds(['1', '1', '', null]), ['1'])
assert.equal(state.isLiked(['1'], '1'), true)

let history = state.recordHistory([], news[0], 100)
history = state.recordHistory(history, news[1], 200)
history = state.recordHistory(history, news[0], 300)
assert.deepEqual(history.map(item => item.id), ['1', '2'])
assert.equal(history[0].viewedAt, 300)

assert.deepEqual(state.incrementViewCount({}, '1'), { '1': 1 })
assert.deepEqual(state.incrementViewCount({ '1': 2 }, '1'), { '1': 3 })

assert.deepEqual(state.sortFavorites([
  { id: '1', favoritedAt: 100 },
  { id: '2', favoritedAt: 200 }
], 'latest').map(item => item.id), ['2', '1'])

assert.deepEqual(state.buildStats({
  favorites: [{ id: '1' }],
  likedIds: ['1', '2'],
  commentsByNews: [[{ id: 'c1' }], [{ id: 'c2' }, { id: 'c3' }]],
  history: [{ id: '1' }, { id: '2' }]
}), { favorites: 1, likes: 2, comments: 3, reads: 2 })

console.log('news state tests passed')
