# 账户权限增量最终只读审查简报

## 需求

1. 个人中心只保留“退出登录”，不提供独立“切换账户”。
2. 退出登录需二次确认，只清除 `campusNewsUser` 和 `app.globalData.userInfo`。
3. 收藏、点赞、阅读历史、评论、阅读量和主题必须保留。
4. 未登录用户可以点赞和取消点赞，但不能发表评论。
5. 未登录时已有评论继续展示，评论输入框替换为登录提示，点击后切换到个人中心。
6. 评论提交方法和公共评论创建逻辑都要校验有效登录资料。
7. 个人中心未登录时隐藏个人统计和数据列表，但夜间模式仍可使用。

## 审查文件

- `utils/auth-session.js`
- `utils/comments.js`
- `tests/auth-session.test.js`
- `tests/comments.test.js`
- `pages/my/my.js`
- `pages/my/my.wxml`
- `pages/my/my.wxss`
- `pages/detail/detail.js`
- `pages/detail/detail.wxml`
- `pages/detail/detail.wxss`
- `README.md`
- `docs/superpowers/specs/2026-08-31-campus-news-enhancements-design.md`
- `docs/superpowers/plans/2026-08-31-account-session-permissions.md`
- `docs/change-logs/2026-08-31-campus-news-enhancements.md`

## 已有验证证据

- `node tests/auth-session.test.js`：通过。
- `node tests/comments.test.js`：通过。
- `node tests/favorites.test.js`：通过。
- `node tests/news-state.test.js`：通过。
- 全部 JavaScript `node --check`：通过。
- 全部 JSON 解析：通过。
- `pages/my` 与 `pages/detail` 的 WXML/WXSS 微信编译：四项通过。
- 模拟器详情页打开成功，console 无 error；automator 和截图桥接超时，因此点击级检查未完成。

## 输出要求

只读审查，不修改任何文件。优先报告功能错误、权限绕过、数据误删、行为回归和缺失测试；按严重度排序并给出文件/行号。若无发现，明确说明，并列出剩余验证风险。
