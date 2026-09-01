function isValidUser(userInfo) {
  return Boolean(
    userInfo &&
    userInfo.profileVersion === 2 &&
    userInfo.avatarUrl &&
    userInfo.nickName
  )
}

function logout(options) {
  const input = options || {}
  if (typeof input.removeStorage === 'function') {
    input.removeStorage('campusNewsUser')
  }
  if (input.app && input.app.globalData) {
    input.app.globalData.userInfo = null
  }
}

module.exports = {
  isValidUser,
  logout
}
