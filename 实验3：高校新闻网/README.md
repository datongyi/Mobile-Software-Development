<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 3：高校新闻网</h2>
  <p align="center">
    中国海洋大学 · 计算机科学与技术专业课程实验代码记录
  </p>
</div>

<!-- 目录 -->
<details>
  <summary>目录 (Table of Contents)</summary>
  <ol>
    <li><a href="#项目简介">项目简介</a></li>
    <li><a href="#实验目标">实验目标</a></li>
    <li><a href="#开发环境">开发环境</a></li>
    <li><a href="#功能列举与简要说明">功能列举与简要说明</a></li>
    <li><a href="#项目结构">项目结构</a></li>
    <li><a href="#核心实现">核心实现</a></li>
    <li><a href="#运行效果">运行效果</a></li>
    <li><a href="#运行方法">运行方法</a></li>
    <li><a href="#问题与解决方法">问题与解决方法</a></li>
    <li><a href="#实验总结">实验总结</a></li>
  </ol>
</details>

<a id="项目简介"></a>

## 项目简介

本项目使用原生 WXML、WXSS、JavaScript 和 JSON 构建高校新闻网微信小程序。项目包含首页、新闻详情页、模拟分享页和个人中心页，其中首页与个人中心通过 `tabBar` 切换。

在实验基础要求之外，项目增加了新闻搜索、分类筛选、点赞、评论、阅读历史、数据统计、夜间模式、退出登录和模拟分享到朋友圈等功能。新闻数据及用户操作记录均保存在本地，不需要配置云开发环境。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验目标"></a>

## 实验目标

1. 掌握微信小程序多页面项目的基本结构及页面注册方式。
2. 使用 `tabBar` 实现首页与个人中心之间的导航切换。
3. 掌握轮播图、新闻列表、条件渲染、列表渲染和事件处理。
4. 实现新闻详情展示、收藏、点赞、评论和本地阅读记录。
5. 使用微信本地缓存保存用户资料和各类交互数据。
6. 完成搜索、分类、个人数据统计、夜间模式和模拟分享等综合功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>

## 开发环境

- 操作系统：Windows / macOS
- 编程语言：WXML / WXSS / JavaScript / JSON
- 开发工具：微信开发者工具 Stable
- 基础库版本：以 `project.config.json` 为准
- 测试环境：微信开发者工具模拟器
- 数据来源：本地模拟新闻数据与微信本地缓存

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="功能列举与简要说明"></a>

## 功能列举与简要说明

| 功能 | 简要说明 |
| ---- | -------- |
| 新闻轮播 | 首页自动循环播放 3 张校园新闻图片，并显示轮播指示点 |
| 新闻列表 | 展示新闻图片、标题、摘要、分类和发布日期，点击后进入全文页面 |
| 分类筛选 | 按“学校要闻”“学术动态”“学生活动”等类别筛选新闻 |
| 关键词搜索 | 根据新闻标题实时过滤列表，并在无结果时显示空状态 |
| 下拉刷新 | 下拉首页重新读取本地新闻数据，并更新加载状态 |
| 新闻详情 | 展示新闻分类、标题、日期、阅读次数、图片和正文 |
| 收藏管理 | 支持收藏和取消收藏；个人中心可排序、查看或删除收藏 |
| 点赞互动 | 登录和未登录状态均可点赞或取消点赞；登录后可在个人中心查看点赞列表 |
| 新闻评论 | 评论列表始终可查看；发表评论必须先登录，评论显示当前用户昵称和头像 |
| 评论删除 | 评论可通过确认弹窗删除，避免误操作 |
| 阅读历史 | 从首页进入详情时记录阅读新闻，并累计本地阅读次数 |
| 用户登录 | 使用微信头像选择器和昵称输入框保存本地用户资料 |
| 退出登录 | 退出前弹出确认框，仅清除用户资料，其他本地数据继续保留 |
| 个人中心 | 在收藏、历史和点赞之间切换，并展示收藏、点赞、评论和阅读统计 |
| 快捷入口 | 首页提供收藏、历史和点赞入口，可直接切换到个人中心对应区域 |
| 夜间模式 | 在个人中心切换浅色或深色主题，并通过本地缓存保持选择 |
| 模拟分享 | 从详情页进入“分享到朋友圈”模拟页，确认后提示“分享完成”并返回详情页 |
| 返回顶部 | 长新闻页面可通过悬浮按钮快速回到页面顶部 |

> 所有新闻、收藏、点赞、评论和阅读记录均为本地模拟数据，只在当前设备或开发者工具缓存中保存，不会同步到其他用户或设备。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>

## 项目结构

```text
实验3：高校新闻网/
├── images/
│   ├── index.png
│   ├── index_blue.png
│   ├── my.png
│   ├── my_blue.png
│   ├── newsimage1.jpg
│   ├── newsimage2.jpg
│   └── newsimage3.jpg
├── pages/
│   ├── index/                 # 首页：轮播、搜索、分类和新闻列表
│   ├── detail/                # 新闻详情：收藏、点赞、评论和分享入口
│   ├── share/                 # 模拟分享到朋友圈页面
│   └── my/                    # 个人中心：登录、退出、统计和内容列表
├── utils/
│   ├── auth-session.js        # 登录资料校验和退出登录清理
│   ├── comments.js            # 评论创建、排序、校验和删除
│   ├── common.js              # 本地新闻数据和查询接口
│   ├── favorites.js           # 收藏数据校验、添加和删除
│   ├── news-state.js          # 搜索、点赞、历史、阅读次数和统计
│   └── util.js
├── tests/
│   ├── auth-session.test.js
│   ├── comments.test.js
│   ├── favorites.test.js
│   └── news-state.test.js
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── sitemap.json
└── README.md
```

| 目录或文件 | 作用 |
| ---------- | ---- |
| `pages/index/` | 首页轮播、分类搜索、快捷入口及新闻跳转 |
| `pages/detail/` | 新闻全文、收藏、点赞、评论、分享和返回顶部 |
| `pages/share/` | 模拟朋友圈分享确认流程 |
| `pages/my/` | 头像昵称登录、退出登录、数据统计和个人内容管理 |
| `utils/common.js` | 提供新闻列表与新闻详情的本地模拟接口 |
| `utils/favorites.js` | 处理收藏数组的校验、添加、判断和删除 |
| `utils/comments.js` | 创建、排序、校验和删除新闻评论 |
| `utils/news-state.js` | 处理新闻筛选、点赞、阅读历史、阅读次数和统计 |
| `utils/auth-session.js` | 判断用户资料是否有效，并限定退出登录的清理范围 |
| `tests/` | 使用 Node.js 断言验证核心状态逻辑 |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>

## 核心实现

### 全局页面与 tabBar

`app.json` 注册首页、详情页、模拟分享页和个人中心页。首页与个人中心位于底部 `tabBar`，详情页和分享页通过页面跳转进入。

```json
{
  "pages": [
    "pages/index/index",
    "pages/detail/detail",
    "pages/share/share",
    "pages/my/my"
  ]
}
```

### 新闻轮播与列表

首页使用 `swiper` 展示 3 张新闻图片，并通过 `wx:for` 渲染新闻列表。点击列表项时携带新闻 `id` 进入详情页。

```xml
<swiper autoplay circular indicator-dots>
  <swiper-item wx:for="{{swiperImg}}" wx:key="src">
    <image src="{{item.src}}" mode="aspectFill"></image>
  </swiper-item>
</swiper>
```

### 搜索与分类筛选

首页同时维护当前分类与关键词，每次输入或切换分类后，通过 `filterNews` 重新生成展示列表，使两种条件能够组合生效。

```javascript
applyFilters() {
  const { newsList, activeCategory, keyword } = this.data
  this.setData({
    filteredNews: newsState.filterNews(newsList, {
      category: activeCategory === '全部' ? '' : activeCategory,
      keyword
    })
  })
}
```

### 新闻详情与收藏

详情页根据页面参数读取新闻全文。收藏使用独立的 `favoriteNews` 缓存键，不遍历其他缓存，因此不会把用户资料、主题或日志误认为收藏内容。

```javascript
addFavorite() {
  const list = favorites.addFavorite(
    wx.getStorageSync('favoriteNews'),
    this.data.article
  )
  wx.setStorageSync('favoriteNews', list)
  this.setData({ isFavorite: true })
}
```

### 点赞、阅读历史与阅读次数

点赞新闻 ID 保存到 `likedNewsIds`。从首页进入新闻详情时，将新闻写入 `readingHistory`，同时更新 `newsViewCounts`。

```javascript
wx.setStorageSync(
  'readingHistory',
  newsState.recordHistory(history, article, Date.now())
)

wx.setStorageSync(
  'newsViewCounts',
  newsState.incrementViewCount(counts, id)
)
```

未登录用户同样可以点赞或取消点赞，但个人中心的点赞列表需要登录后才能查看。

### 新闻评论

不同新闻使用 `newsComments_<newsId>` 作为独立缓存键。评论列表在登录和未登录状态下均可查看；发表评论前必须完成头像昵称登录，页面方法和公共评论模块会分别校验用户资料。

```javascript
const item = comments.createComment({
  content: this.data.commentContent,
  userInfo,
  now: Date.now()
})

const list = comments.addComment(this.data.comments, item)
wx.setStorageSync(`newsComments_${this.data.article.id}`, list)
```

评论内容自动去除首尾空格，空内容不会提交。删除评论前使用 `wx.showModal` 二次确认，确认后再更新当前列表和本地缓存。

### 用户资料与退出登录

个人中心使用 `open-type="chooseAvatar"` 选择微信头像，并使用 `type="nickname"` 输入昵称。

```xml
<button open-type="chooseAvatar" bind:chooseavatar="chooseAvatar">
  选择微信头像
</button>
<input type="nickname" placeholder="填写微信昵称" bindinput="inputNickname" />
```

退出登录前弹出确认框。退出只移除 `campusNewsUser` 并清空运行时用户状态，不删除收藏、点赞、历史、评论、阅读量或主题。重新登录后可以继续查看原有数据。

### 夜间模式

主题选择保存在 `campusNewsTheme` 中。首页、详情页和个人中心在显示时读取该缓存，通过页面最外层主题类切换背景、卡片和文字颜色。

```javascript
toggleTheme() {
  const theme = this.data.theme === 'dark' ? 'light' : 'dark'
  wx.setStorageSync('campusNewsTheme', theme)
  this.setData({ theme })
}
```

<a id="运行效果"></a>

## 运行效果

编译运行后，小程序能够完成以下操作：

1. 首页自动播放校园新闻图片，并展示新闻列表和摘要。
2. 输入新闻关键词或切换新闻分类，列表实时更新。
3. 点击新闻进入详情页，查看标题、图片、正文、日期和阅读次数。
4. 收藏、点赞或取消相应状态，并在个人中心查看操作结果。
5. 未登录时可以点赞，但评论区提示先登录；登录后可以发表评论和删除评论。
6. 在个人中心查看收藏、历史、点赞及四项数据统计。
7. 退出登录后个人列表暂时隐藏，重新登录后原有本地数据仍可查看。
8. 对收藏内容进行时间排序或单条删除。
9. 切换夜间模式，并在不同页面之间保持主题选择。
10. 进入模拟朋友圈分享页，确认后提示“分享完成”并返回新闻详情。
11. 使用详情页悬浮按钮快速返回页面顶部。

<p align="center">
  <img src="images/newsimage1.jpg" alt="高校新闻网新闻图片示例" width="420">
</p>

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>

## 运行方法

1. 克隆或下载代码仓库到本地环境。
2. 打开微信开发者工具，选择“导入项目”。
3. 选择包含 `project.config.json` 的 `实验3：高校新闻网` 目录。
4. 根据需要将项目 AppID 替换为自己可使用的小程序 AppID。
5. 点击顶部菜单中的“编译”，在模拟器或真机中体验功能。

```bash
git clone https://github.com/datongyi/Mobile-Software-Development.git
cd "Mobile-Software-Development/实验3：高校新闻网"
```

如需运行公共逻辑测试，请在安装了 Node.js 的终端中执行：

```bash
node tests/auth-session.test.js
node tests/favorites.test.js
node tests/comments.test.js
node tests/news-state.test.js
```

> 用户资料、收藏、点赞、评论、阅读历史和主题均保存在本地缓存中。清除微信开发者工具缓存或更换设备后，这些数据不会保留。

> `project.private.config.json` 通常包含本机开发者工具配置。上传 GitHub 前应根据仓库管理方式决定是否忽略该文件，避免提交仅适用于个人环境的设置。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：开发者工具提示文件保存冲突

在外部工具修改项目文件后，微信开发者工具可能显示“文件中的版本”和“开发者工具中的版本”存在冲突。这并非小程序运行错误，而是编辑器仍保留旧内容。

应保留磁盘中的最新版本，关闭冲突标签，并在询问是否保存时选择“不保存”。重新打开文件后再点击“编译”，可避免旧模板覆盖新代码。

### 问题 2：旧版用户资料接口只能返回默认头像昵称

旧教程常使用 `wx.getUserProfile` 获取用户信息，但在当前隐私规则和基础库中，该接口可能只能得到默认头像和“微信用户”。本项目改用 `open-type="chooseAvatar"` 和 `input type="nickname"`，由用户主动选择头像并填写昵称。

### 问题 3：遍历全部缓存会把无关数据当作收藏

如果使用 `wx.getStorageInfoSync()` 遍历所有缓存键，日志、用户资料和主题设置也可能被错误计入收藏夹。项目使用独立的 `favoriteNews` 缓存键保存收藏数组，并通过 `favorites.js` 统一校验数据结构。

### 问题 4：新闻详情图片宽度异常

部分开发者工具版本中，详情图片使用 `width: 100%` 时可能无法正常显示。详情页将图片设置为固定 `rpx` 宽度并增加 `max-width: 100%`，使其既能正常渲染，也不会超出页面容器。

### 问题 5：未登录用户不能发表评论

详情页的评论输入框只在有效登录状态下显示。提交方法和 `comments.js` 都会再次校验用户资料，避免仅通过界面隐藏造成权限绕过。未登录用户仍可以浏览已有评论以及点赞新闻。

### 问题 6：本地互动数据无法跨设备同步

评论、点赞和阅读记录全部使用本地缓存实现，因此只适合课程实验和单设备演示。“登录后评论”属于前端本地权限控制，不等同于服务端鉴权。若需要多用户共享评论、跨设备同步和真实权限控制，应将相关数据迁移到微信云开发数据库或独立服务端。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>

## 实验总结

通过本实验，我完成了一个包含首页、新闻详情页、模拟分享页和个人中心页的原生微信小程序，并进一步掌握了多页面导航、`tabBar`、列表渲染、本地缓存和页面生命周期的使用方法。项目从基础的新闻轮播、全文阅读和收藏功能，扩展到搜索分类、点赞评论、阅读历史、数据统计、夜间模式、退出登录和模拟分享，形成了较完整的新闻浏览与用户互动流程。

开发过程中，我将新闻数据、收藏、评论、登录状态和新闻互动状态拆分为独立公共模块，并使用 Node.js 断言测试验证核心逻辑。这种结构减少了页面代码中的重复处理，也方便后续将本地模拟数据替换为云数据库或远程接口。

本实验仍采用本地数据方案，适合稳定演示和理解小程序前端逻辑。如果继续完善，可以增加服务端新闻管理、用户鉴权、评论权限审核、分页加载和多设备数据同步等能力。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
