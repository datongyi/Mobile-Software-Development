# 高校新闻网综合扩展实现计划

> **面向 AI 代理的工作者：** 使用子代理驱动开发并行实现互不重叠的页面任务；公共模块由主代理维护。所有步骤使用复选框跟踪。

**目标：** 在不增加云服务和新业务页面的前提下，为现有高校新闻网增加分类、搜索、互动、历史、收藏管理、快捷入口、夜间模式、分享、刷新状态和个人统计。

**架构：** `utils/common.js` 继续提供新闻数据；新增 `utils/news-state.js` 负责筛选、点赞、历史和统计等纯运算，`utils/comments.js` 负责评论纯运算。页面负责调用微信缓存 API 和渲染，缓存写入只有在交互成功后发生。

**技术栈：** 微信小程序 JavaScript/WXML/WXSS、微信本地缓存 API、Node.js 断言测试、微信开发者工具编译与自动化。

---

## 公共接口和缓存键

- `favoriteNews`：收藏新闻数组，项目已有。
- `likedNewsIds`：点赞新闻 ID 数组。
- `readingHistory`：含 `viewedAt` 的新闻数组，最新阅读在前。
- `newsViewCounts`：以新闻 ID 为键的阅读次数对象。
- `newsComments_<newsId>`：单条新闻评论数组。
- `campusNewsTheme`：`light` 或 `dark`。
- `myActiveSection`：`favorites`、`history` 或 `likes`。

### 任务 1：公共数据与纯函数

**文件：**
- 修改：`utils/common.js`
- 创建：`utils/news-state.js`
- 创建：`utils/comments.js`
- 创建：`tests/news-state.test.js`
- 创建：`tests/comments.test.js`
- 修改：`tests/favorites.test.js`

- [ ] 先编写筛选、点赞、历史、统计、评论、收藏时间排序的失败测试。
- [ ] 运行测试确认因模块或函数缺失而失败。
- [ ] 实现最小纯函数并运行全部测试确认通过。
- [ ] 扩展新闻数据的分类字段和演示新闻数量。

### 任务 2：首页增强（并行）

**文件：**
- 修改：`pages/index/index.js`
- 修改：`pages/index/index.json`
- 修改：`pages/index/index.wxml`
- 修改：`pages/index/index.wxss`

- [ ] 添加搜索、分类筛选和组合过滤。
- [ ] 添加三个快捷入口，并通过缓存切换个人中心区域。
- [ ] 打开详情前记录阅读历史和阅读次数。
- [ ] 添加加载、空状态、下拉刷新和夜间模式样式。

### 任务 3：详情互动（并行）

**文件：**
- 修改：`pages/detail/detail.js`
- 修改：`pages/detail/detail.json`
- 修改：`pages/detail/detail.wxml`
- 修改：`pages/detail/detail.wxss`

- [ ] 添加点赞、分享和返回顶部。
- [ ] 添加评论输入、倒序列表、登录用户昵称和删除确认；历史游客评论只做兼容展示。
- [ ] 详情加载时读取收藏、点赞、阅读量和评论。
- [ ] 添加夜间模式和空状态样式。

### 任务 4：个人中心增强（并行）

**文件：**
- 修改：`pages/my/my.js`
- 修改：`pages/my/my.wxml`
- 修改：`pages/my/my.wxss`

- [ ] 添加收藏、历史、点赞三个内容分栏。
- [ ] 收藏支持最新/最早排序和单条删除确认。
- [ ] 添加收藏、点赞、评论、阅读统计卡片。
- [ ] 添加夜间模式开关并同步页面主题。

### 任务 5：全局样式与集成

**文件：**
- 修改：`app.js`
- 修改：`app.wxss`

- [ ] 初始化主题全局状态。
- [ ] 添加跨页面复用的夜间主题、按钮、状态和列表样式。
- [ ] 检查三个并行页面调用的公共接口一致。

### 任务 6：验证与记录

**文件：**
- 修改：`docs/change-logs/2026-08-31-campus-news-enhancements.md`

- [ ] 运行全部 Node 测试、JS 语法检查和 JSON 解析检查。
- [ ] 串行编译三个页面的 WXML/WXSS。
- [ ] 在模拟器验证首页筛选、详情互动和个人中心管理。
- [ ] 发起一次只读最终审查；没有返回时不轮询。
- [ ] 记录全部命令、结果、已知限制和回滚基线。
