# 高校新闻网实现计划

> **面向 AI 代理的工作者：** 在当前任务内逐项执行，并用测试与微信开发者工具验证。

**目标：** 完成符合实验要求的三页高校新闻网微信小程序。

**架构：** `common.js` 负责静态新闻数据，`favorites.js` 负责纯收藏列表运算；页面只负责视图状态、页面跳转与微信本地缓存读写。首页和个人中心注册为 tabBar 页面，详情页通过 `navigateTo` 打开。

**技术栈：** 微信小程序 WXML/WXSS/JavaScript、微信本地缓存 API、Node.js 内置测试断言。

---

### 任务 1：收藏行为

**文件：**
- 创建：`tests/favorites.test.js`
- 创建：`utils/favorites.js`

- [ ] 先编写测试，覆盖异常缓存清洗、添加去重、状态判断和取消收藏。
- [ ] 运行测试并确认因模块缺失而失败。
- [ ] 实现最小收藏列表函数并确认测试通过。

### 任务 2：应用配置与公共数据

**文件：**
- 修改：`app.js`
- 修改：`app.json`
- 修改：`app.wxss`
- 修改：`utils/common.js`

- [ ] 配置三个页面、导航栏和首页/个人中心 tabBar。
- [ ] 将新闻图片改为项目内本地图片，并设置公共新闻列表样式。

### 任务 3：首页和新闻详情页

**文件：**
- 修改：`pages/index/index.js`
- 修改：`pages/index/index.wxml`
- 修改：`pages/index/index.wxss`
- 修改：`pages/detail/detail.js`
- 修改：`pages/detail/detail.wxml`
- 修改：`pages/detail/detail.wxss`

- [ ] 首页展示三图自动轮播和可点击新闻列表。
- [ ] 详情页展示标题、图片、正文、日期以及收藏/取消收藏按钮。

### 任务 4：个人中心页

**文件：**
- 修改：`pages/my/my.js`
- 修改：`pages/my/my.wxml`
- 修改：`pages/my/my.wxss`

- [ ] 未登录时显示登录按钮和空收藏。
- [ ] 登录后显示微信头像昵称，并在每次显示页面时刷新收藏列表。
- [ ] 收藏新闻可点击进入详情页。

### 任务 5：验证

- [ ] 运行收藏单元测试和 JavaScript 语法检查。
- [ ] 使用微信开发者工具检查 WXML/WXSS 编译结果。
- [ ] 打开首页、详情页和个人中心，核对控制台无业务错误。
