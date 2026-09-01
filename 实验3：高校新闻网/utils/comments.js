const authSession = require('./auth-session.js')

function isValidComment(item) {
  return Boolean(
    item &&
    item.id &&
    item.nickname &&
    item.content &&
    Number.isFinite(Number(item.createdAt))
  )
}

function normalizeComments(value) {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter(isValidComment).slice().sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
}

function createComment(options) {
  const input = options || {}
  const content = String(input.content || '').trim()
  if (!content) {
    return null
  }
  const now = Number(input.now || Date.now())
  const userInfo = authSession.isValidUser(input.userInfo) ? input.userInfo : null
  if (!userInfo) {
    return null
  }
  return {
    id: `comment-${now}-${Math.random().toString(36).slice(2, 8)}`,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    content,
    createdAt: now,
    createdText: input.createdText || formatTime(now)
  }
}

function addComment(list, comment) {
  return normalizeComments([comment].concat(normalizeComments(list)))
}

function removeComment(list, commentId) {
  return normalizeComments(list).filter(item => item.id !== commentId)
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

module.exports = {
  normalizeComments,
  createComment,
  addComment,
  removeComment,
  formatTime
}
