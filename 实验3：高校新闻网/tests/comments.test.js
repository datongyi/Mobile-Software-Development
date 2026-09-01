const assert = require('node:assert/strict')
const comments = require('../utils/comments.js')

const older = {
  id: 'c1',
  nickname: '游客',
  avatarUrl: '',
  content: '较早评论',
  createdAt: 100,
  createdText: '2026-08-31 10:00'
}
const newer = {
  id: 'c2',
  nickname: '小明',
  avatarUrl: '/avatar.png',
  content: '较新评论',
  createdAt: 200,
  createdText: '2026-08-31 10:01'
}

assert.deepEqual(comments.normalizeComments(null), [])
assert.deepEqual(comments.normalizeComments([{}, older, newer]).map(item => item.id), ['c2', 'c1'])
assert.deepEqual(comments.addComment([older], newer).map(item => item.id), ['c2', 'c1'])
assert.deepEqual(comments.removeComment([newer, older], 'c2'), [older])
assert.equal(comments.createComment({ content: '   ', now: 1 }), null)

const guestComment = comments.createComment({
  content: '  新闻很好  ',
  userInfo: null,
  now: 300,
  createdText: '2026-08-31 10:02'
})
assert.equal(guestComment, null)

const created = comments.createComment({
  content: '  新闻很好  ',
  userInfo: {
    profileVersion: 2,
    avatarUrl: '/avatar.png',
    nickName: '小明'
  },
  now: 300,
  createdText: '2026-08-31 10:02'
})
assert.equal(created.nickname, '小明')
assert.equal(created.avatarUrl, '/avatar.png')
assert.equal(created.content, '新闻很好')
assert.equal(created.createdAt, 300)

console.log('comments tests passed')
