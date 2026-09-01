const assert = require('node:assert/strict')
const authSession = require('../utils/auth-session.js')

const validUser = {
  profileVersion: 2,
  avatarUrl: '/avatar.png',
  nickName: '小明'
}

assert.equal(authSession.isValidUser(validUser), true)
assert.equal(authSession.isValidUser(null), false)
assert.equal(authSession.isValidUser({ profileVersion: 1, avatarUrl: '/avatar.png', nickName: '小明' }), false)
assert.equal(authSession.isValidUser({ profileVersion: 2, avatarUrl: '', nickName: '小明' }), false)
assert.equal(authSession.isValidUser({ profileVersion: 2, avatarUrl: '/avatar.png', nickName: '' }), false)

const storage = {
  campusNewsUser: validUser,
  favoriteNews: [{ id: '1' }],
  likedNewsIds: ['1'],
  readingHistory: [{ id: '1' }],
  campusNewsTheme: 'dark'
}
const removedKeys = []
const app = { globalData: { userInfo: validUser, theme: 'dark' } }

authSession.logout({
  app,
  removeStorage(key) {
    removedKeys.push(key)
    delete storage[key]
  }
})

assert.deepEqual(removedKeys, ['campusNewsUser'])
assert.equal(app.globalData.userInfo, null)
assert.deepEqual(storage.favoriteNews, [{ id: '1' }])
assert.deepEqual(storage.likedNewsIds, ['1'])
assert.deepEqual(storage.readingHistory, [{ id: '1' }])
assert.equal(storage.campusNewsTheme, 'dark')

console.log('auth session tests passed')
