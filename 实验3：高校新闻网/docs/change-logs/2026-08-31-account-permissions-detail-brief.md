# 详情页评论权限任务简报

## 目标

仅修改 `pages/detail/detail.js`、`pages/detail/detail.wxml`、`pages/detail/detail.wxss`，实现未登录可点赞但不能评论。

## 已有依赖

- `utils/auth-session.js` 导出 `isValidUser(userInfo)`。
- `utils/comments.js` 已在创建评论时拒绝无效用户资料。
- 既有评论列表（含历史游客评论）必须继续展示和允许原有删除操作。

## 必须实现

1. 页面 `data` 新增 `isLogin: false`。
2. `syncInteractionState()` 从 `app.globalData.userInfo || wx.getStorageSync('campusNewsUser')` 读取资料，并用 `authSession.isValidUser` 更新 `isLogin`。
3. `toggleLike()` 不增加登录检查，游客仍可点赞和取消点赞。
4. WXML 中：登录时显示 textarea 和“发表评论”；未登录时显示“登录后才能发表评论”的明确提示及按钮。
5. 新增 `goToLogin()`，调用 `wx.switchTab({ url: '/pages/my/my' })`。
6. `submitComment()` 先检查有效登录用户；无效时显示 `请先登录` 并直接返回。有效时把该用户传给 `comments.createComment()`。
7. 样式适配浅色和夜间模式，登录提示不能覆盖评论列表。

## 验证

- `node --check pages/detail/detail.js`
- 检查 WXML 中不存在“游客也可评论”。
- 不修改其他文件，不提交 git。

## 报告

将完整报告写入 `docs/change-logs/2026-08-31-account-permissions-detail-report.md`。
