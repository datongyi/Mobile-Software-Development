# 账户会话与评论权限实现计划

> **面向 AI 代理的工作者：** 使用测试驱动方式执行，各页面独立修改，最后统一验证。

**目标：** 增加退出登录，并允许未登录用户点赞但禁止发表评论。

**架构：** 新增纯函数会话模块统一校验本地用户资料，并限定退出操作只清除 `campusNewsUser` 与全局用户状态。个人中心负责账户操作，详情页根据统一登录状态渲染评论入口并在提交方法中再次鉴权；点赞流程保持现状。

**技术栈：** 微信小程序原生 JavaScript、WXML、WXSS，本地缓存，Node.js `assert` 测试。

---

### 任务 1：会话规则

**文件：**
- 创建：`utils/auth-session.js`
- 创建：`tests/auth-session.test.js`

- [x] 编写有效用户、无效用户与退出清理范围测试。
- [x] 运行测试并确认因模块缺失而失败。
- [x] 实现 `isValidUser` 与 `logout` 最小逻辑。
- [x] 运行测试并确认通过。

### 任务 2：个人中心退出登录

**文件：**
- 修改：`pages/my/my.js`
- 修改：`pages/my/my.wxml`
- 修改：`pages/my/my.wxss`

- [x] 统一使用会话模块判断登录状态。
- [x] 登录态增加“退出登录”。
- [x] 退出登录二次确认，只清除用户资料并隐藏个人列表。

### 任务 3：详情页评论权限

**文件：**
- 修改：`pages/detail/detail.js`
- 修改：`pages/detail/detail.wxml`
- 修改：`pages/detail/detail.wxss`

- [x] 页面显示时同步登录状态。
- [x] 未登录时隐藏评论输入框并展示登录入口。
- [x] 提交方法增加登录校验，防止绕过界面提交。
- [x] 登录入口切换到个人中心 tab。
- [x] 保持未登录点赞与取消点赞可用。

### 任务 4：文档与验证

**文件：**
- 修改：`README.md`
- 修改：`docs/superpowers/specs/2026-08-31-campus-news-enhancements-design.md`
- 修改：`docs/change-logs/2026-08-31-campus-news-enhancements.md`

- [x] 更新功能说明与权限规则。
- [x] 运行四个 Node 测试、全部 JavaScript 语法检查和 JSON 解析。
- [x] 编译个人中心与详情页 WXML/WXSS，并执行模拟器关键流程检查。
- [x] 只发起一次最终只读审查，不轮询审查结果。
