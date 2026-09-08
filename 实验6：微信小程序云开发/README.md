<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 6：微信小程序云开发</h2>
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
    <li><a href="#云开发部署">云开发部署</a></li>
    <li><a href="#问题与解决方法">问题与解决方法</a></li>
    <li><a href="#实验总结">实验总结</a></li>
    <li><a href="#github提交说明">GitHub 提交说明</a></li>
  </ol>
</details>

<a id="项目简介"></a>

## 项目简介

本项目使用原生 WXML、WXSS、JavaScript 和 JSON 构建图片分享社区微信小程序，并在“云开发企业官网”初始模板的基础上完成改造。项目以微信云开发为后端，使用云数据库保存图片元数据，使用云存储保存图片文件，使用云函数获取当前用户 OpenID。

小程序包含首页公共图片流、图片上传页、作者个人主页和图片详情页。用户可以填写昵称、选择头像和地区，上传图片到云端，浏览其他用户公开的图片，进入作者主页查看作品，并在自己的主页删除已上传图片。

项目保留了模板中的云初始化和版本更新处理方式，但移除了与图片社区无关的企业官网页面、旧 Mock 服务和未使用的组件，使仓库内容与当前功能保持一致。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验目标"></a>

## 实验目标

1. 掌握微信小程序多页面项目的基本结构、页面注册和页面跳转方式。
2. 掌握微信云开发环境的初始化和云环境配置方法。
3. 使用云函数获取当前用户 OpenID，并在客户端缓存会话身份。
4. 使用云存储完成图片文件上传、临时链接转换、下载和删除。
5. 使用云数据库 `photos` 集合保存图片元数据，并完成查询、分页和删除。
6. 综合使用图片选择器、头像选择器、昵称输入框、地区选择器和相册保存接口。
7. 为网络操作补充加载、空状态、失败、重试和删除确认等交互反馈。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>

## 开发环境

- 操作系统：Windows / macOS
- 编程语言：WXML / WXSS / JavaScript / JSON
- 开发工具：微信开发者工具 Stable
- 基础库版本：以 `project.config.json` 为准
- 测试环境：微信开发者工具模拟器，必要时使用真机预览
- 后端服务：微信云开发（云数据库、云存储、云函数）
- 云环境：`cloud1-d5gpui3epda8ace92`（示例环境，使用其他账号时需要替换）
- 数据库集合：`photos`
- Node.js：用于运行 `tests/photo-utils.test.cjs` 中的纯函数测试

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="功能列举与简要说明"></a>

## 功能列举与简要说明

| 功能 | 简要说明 |
| ---- | -------- |
| 公共图片流 | 首页读取 `photos` 集合，按创建时间倒序展示所有公开图片 |
| 下拉刷新 | 下拉首页重新读取云端图片并更新列表 |
| 触底加载 | 滚动到底部时加载下一页图片，显示加载中和到底提示 |
| 图片选择 | 使用 `wx.chooseMedia` 选择一张图片，兼容旧基础库的 `wx.chooseImage` |
| 图片预览 | 上传前显示本地预览，支持重新选择 |
| 图片上传 | 图片文件上传到云存储，元数据写入 `photos` 集合 |
| 上传者资料 | 使用头像选择器、昵称输入框和地区选择器维护展示资料 |
| OpenID 获取 | `getOpenid` 云函数返回当前微信用户 OpenID，并由应用缓存 |
| 作者主页 | 点击图片作者查看该作者的资料和全部作品 |
| 我的主页 | 首页和上传页均提供入口，查看当前用户上传记录 |
| 图片删除 | 个人主页确认后删除本人数据库记录及对应云存储文件 |
| 图片详情 | 查看大图、作者资料、地区和上传日期 |
| 全屏预览 | 调用 `wx.previewImage` 查看完整图片 |
| 保存到相册 | 云文件先下载到临时路径，再调用 `wx.saveImageToPhotosAlbum` 保存 |
| 微信分享 | 详情页通过 `open-type="share"` 分享图片详情路径 |
| 云文件显示 | 将 `cloud://` 文件 ID 转换成临时 HTTPS 地址后绑定到 `<image>` |
| 异常反馈 | 覆盖加载、空数据、云端失败、取消选择、重试和删除确认等状态 |
| 失败清理 | 数据库写入失败时删除本次已上传的云文件，减少孤立文件 |

> 当前版本聚焦云开发基础功能，未实现点赞、评论、搜索、关注、批量上传和内容审核等扩展功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>

## 项目结构

```text
实验6：微信小程序云开发/
├── cloudfunctions/
│   └── getOpenid/
│       ├── index.js              # 获取当前用户 OpenID
│       └── package.json          # 云函数运行依赖
├── common/
│   └── updateManager.js          # 小程序版本更新处理
├── components/
│   └── photo-card/
│       ├── index.js              # 图片卡片事件
│       ├── index.json
│       ├── index.wxml            # 作者信息和图片展示
│       └── index.wxss
├── config/
│   └── index.js                 # 云环境 ID 和照片服务开关
├── images/
│   └── icons/
│       └── about.png            # 默认头像
├── pages/
│   ├── index/                   # 首页公共图片流
│   ├── add/                     # 图片上传和上传记录
│   ├── homepage/               # 作者/个人主页和删除操作
│   └── detail/                 # 图片详情、预览、分享和保存
├── services/
│   └── photos/
│       └── index.js             # 云数据库和云存储统一服务
├── tests/
│   └── photo-utils.test.cjs     # 图片工具函数测试
├── utils/
│   └── photo.js                 # 日期、扩展名和云路径工具
├── app.js                       # 应用入口和云开发初始化
├── app.json                     # 页面注册和全局配置
├── app.wxss                    # 全局样式
├── package.json                # 本地测试脚本
├── project.config.json         # 微信开发者工具公共配置
├── sitemap.json               # 页面索引规则
├── .gitignore                 # Git 忽略规则
└── README.md
```

| 目录或文件 | 作用 |
| ---------- | ---- |
| `pages/index/` | 首页图片流、下拉刷新、分页和跳转入口 |
| `pages/add/` | 维护上传者资料，选择并上传图片，查看上传记录 |
| `pages/homepage/` | 查询指定 OpenID 的作品，并允许本人删除图片 |
| `pages/detail/` | 读取单条图片记录，完成预览、分享和保存 |
| `components/photo-card/` | 复用图片卡片展示和作者/详情点击事件 |
| `services/photos/index.js` | 封装查询、上传、临时链接解析、写入和删除 |
| `cloudfunctions/getOpenid/` | 通过 `cloud.getWXContext()` 返回 OpenID |
| `utils/photo.js` | 处理日期格式、文件扩展名、云路径和记录格式化 |
| `config/index.js` | 设置云环境及是否启用照片 Mock/本地兜底 |
| `tests/` | 使用 Node.js 内置测试运行器验证纯函数 |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>

## 核心实现

### 云开发初始化与用户身份

应用启动时初始化指定云环境，并调用 `getOpenid` 云函数获取当前用户身份。`traceUser: true` 让云开发请求携带用户上下文，数据库新增记录时由云端自动生成 `_openid`。

```javascript
if (wx.cloud) {
  wx.cloud.init({
    env: cloudbaseTemplateConfig.env,
    traceUser: true
  })
}

wx.cloud.callFunction({ name: 'getOpenid' })
```

### 图片上传与元数据写入

上传流程由 `services/photos/index.js` 统一处理：先生成带 OpenID 和时间戳的云存储路径，上传图片文件，再向 `photos` 集合写入图片地址、作者资料和创建时间。数据库写入失败时会尝试删除刚上传的文件。

```javascript
const cloudPath = buildCloudPath({
  openid,
  filePath
})

const uploaded = await uploadFile({ cloudPath, filePath })
const record = await addPhoto({
  photoUrl: uploaded.fileID,
  cloudPath,
  profile
})
```

云数据库记录不手动写入 `_openid`，由云开发依据当前登录上下文自动生成，避免客户端伪造用户身份或导致写入失败。

### 图片查询与分页

首页查询所有图片，个人主页按 `_openid` 筛选图片。服务层读取记录后在客户端按 `createdAt` 排序，再按照页面的 `page` 和 `pageSize` 截取数据。这样不依赖额外的 `createdAt` 索引，适合本实验的小规模图片流。

```javascript
let query = wx.cloud.database().collection('photos')
if (openid) query = query.where({ _openid: openid })

const response = await query.limit(100).get()
const list = sortPhotos(response.data || [])
```

### 云存储文件显示

云存储上传后返回的 `cloud://` 文件 ID 适合云 API 调用，但不应直接假设所有运行环境都能用它渲染图片。服务层调用 `wx.cloud.getTempFileURL`，将文件 ID 转为临时 HTTPS 地址，同时保留原始 `fileID` 供下载和删除。

```javascript
const response = await wx.cloud.getTempFileURL({
  fileList: [photo.fileID]
})

photo.photoUrl = response.fileList[0].tempFileURL
```

临时链接只用于当前页面显示，不写回数据库，也不作为永久资源地址。

### 个人主页与删除

首页通过“我的主页”入口取得当前用户 OpenID，个人主页只查询该用户的图片。删除操作先弹出确认框，再删除 `photos` 集合记录和对应的云存储文件。数据库集合权限仍是最终安全边界，客户端的 `isOwner` 只负责控制界面显示。

```javascript
await deletePhoto({
  id: item._id,
  fileID: item.fileID || item.photoUrl
})
```

### 用户资料与本地缓存

头像、昵称和地区资料保存在小程序本地缓存 `photoCommunityProfile` 中。新选择的微信临时头像会先上传到 `avatars/<openid>/`，后续上传图片时复用云端头像地址；没有头像时使用项目内的默认头像。

```xml
<button open-type="chooseAvatar" bindchooseavatar="onChooseAvatar">
  更换头像
</button>
<input type="nickname" bindinput="onNicknameInput" />
<picker mode="region" bindchange="onRegionChange">
  所在地区
</picker>
```

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行效果"></a>

## 运行效果

编译运行后，小程序能够完成以下操作：

1. 进入首页，读取云数据库中的公开图片并按时间倒序显示。
2. 点击“上传图片”，填写昵称，选择头像和地区，再选择一张本地图片。
3. 上传成功后，云存储产生图片文件，`photos` 集合产生对应的元数据记录。
4. 返回首页刷新，可以看到新上传的图片和作者信息。
5. 点击图片作者进入作者主页，查看该作者的全部作品。
6. 点击“我的主页”查看当前账号的上传记录。
7. 在个人主页点击“删除这张图片”，确认后同时删除记录和云文件。
8. 点击图片进入详情页，可全屏预览、转发给好友或保存到系统相册。
9. 在云端不可用、集合为空或网络失败时，页面显示对应的提示和重试入口。

本项目不在 README 中引用本机调试截图，避免将课程资料或个人环境文件混入 GitHub 仓库。需要展示界面时，可在仓库中另行添加经过脱敏的截图。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>

## 运行方法

1. 克隆或下载代码仓库。
2. 打开微信开发者工具，选择“导入项目”。
3. 选择包含 `project.config.json` 的项目目录。
4. 将 `project.config.json` 中的 AppID 替换为自己有权限使用的小程序 AppID。
5. 在 `config/index.js` 中填写自己云环境的环境 ID。
6. 按照“云开发部署”章节创建数据库集合并部署云函数。
7. 点击微信开发者工具顶部的“编译”，在模拟器或真机中运行。

```bash
git clone https://github.com/<用户名>/<仓库名>.git
cd "实验6：微信小程序云开发"
npm test
```

项目运行时不需要提交或预先生成 `node_modules/`、`miniprogram_npm/`。当前业务代码使用微信原生云开发 API，本地测试仅依赖 Node.js 内置测试运行器。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="云开发部署"></a>

## 云开发部署

### 1. 开通并选择云环境

在微信开发者工具中打开云开发，选择已有云环境或创建新环境。将环境 ID 写入 `config/index.js`：

```javascript
export const cloudbaseTemplateConfig = {
  env: '你的云环境 ID',
  photoUseMock: false,
  allowPhotoFallback: false
}
```

### 2. 创建数据库集合

在云开发控制台创建集合：

```text
photos
```

建议将集合权限设置为“所有用户可读、创建者可写/删除”。应用会自动写入 `_id` 和 `_openid`，不需要手动添加这两个字段。

一条图片记录包含以下主要字段：

| 字段 | 说明 |
| ---- | ---- |
| `_id` | 云数据库自动生成的记录 ID |
| `_openid` | 云数据库依据当前用户上下文自动生成的 OpenID |
| `photoUrl` | 云存储图片文件 ID |
| `cloudPath` | 图片在云存储中的相对路径 |
| `avatarUrl` | 作者头像文件 ID 或默认头像路径 |
| `nickName` | 作者昵称 |
| `country` / `province` / `city` | 地区选择器产生的地区信息 |
| `addDate` | `YYYY-MM-DD` 格式的兼容显示日期 |
| `createdAt` | `db.serverDate()` 生成的服务端创建时间 |

### 3. 部署云函数

将 `cloudfunctions/getOpenid/` 部署到云环境，函数名称必须为：

```text
getOpenid
```

在微信开发者工具中右键该目录，选择“创建并部署：云端安装依赖”。云函数通过 `wx-server-sdk` 的 `cloud.getWXContext().OPENID` 获取当前用户 OpenID。

### 4. 编译和上传体验版

完成数据库和云函数配置后：

1. 点击“编译”，确认首页、上传页、个人主页和详情页均可打开。
2. 重新上传一张测试图片，检查云存储和 `photos` 集合是否同时出现数据。
3. 点击首页“我的主页”，测试上传记录和删除操作。
4. 如需在手机上测试，使用“预览”生成二维码。
5. 如需发布体验版，使用微信开发者工具的“上传”功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：云存储有图片，但首页没有显示

图片上传和数据库写入是两个独立步骤。如果数据库写入失败，云存储可能已经产生文件，但首页查询不到对应记录。常见原因是客户端手动写入 `_openid`、集合权限不允许写入，或小程序连接了错误的云环境。

项目将 `_openid` 交给云数据库自动生成，固定客户端云环境，并在写入失败时清理本次文件。排查时应同时检查 `photos` 集合和云存储目录，而不是只看其中一处。

### 问题 2：数据库中的 `cloud://` 地址绑定到图片后不显示

`cloud://` 是云文件 ID，不是所有页面和运行环境都能直接渲染的 HTTP 地址。服务层统一调用 `wx.cloud.getTempFileURL` 转换临时地址，页面只使用转换后的 `photoUrl`，删除和下载仍使用保留的原始 `fileID`。

### 问题 3：上传后找不到个人主页入口

项目在首页顶部提供“我的主页”入口，在上传页的“我的上传记录”标题旁也提供入口。进入个人主页时使用当前会话 OpenID 查询图片，并根据 OpenID 判断是否显示删除按钮。

### 问题 4：删除图片后云存储文件仍然存在

数据库记录和云文件删除也不是同一个操作。项目先删除数据库记录，再调用 `wx.cloud.deleteFile` 删除原始 fileID。若历史记录只保存了临时 URL，无法可靠删除，因此服务层始终保留 `fileID` 别名。

### 问题 5：旧版用户信息接口只能得到默认头像和昵称

旧教程中的自动获取用户资料接口在新版本基础库和隐私规则下可能无法正常取得信息。项目改用用户主动操作的 `chooseAvatar`、`type="nickname"` 输入框和地区选择器，并把资料保存到本地缓存。

### 问题 6：云端失败被误显示为上传成功

如果请求失败后自动回退到本地 Mock，页面可能显示成功，但其他设备看不到数据。当前生产配置将 `photoUseMock` 和 `allowPhotoFallback` 均设为 `false`，云端失败会直接显示错误，便于定位配置问题。

### 问题 7：上传 GitHub 后项目无法直接使用

`project.private.config.json` 是微信开发者工具的本机私有配置，不能依赖它作为公共项目配置。克隆项目后应使用 `project.config.json` 导入，再填写自己的 AppID 和云环境 ID，并重新部署云函数和创建数据库集合。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>

## 实验总结

通过本实验，我在已有小程序模板的基础上完成了一个基于微信云开发的图片分享社区，掌握了云环境初始化、云函数调用、云数据库读写、云存储文件管理和多页面交互的基本流程。

项目将首页图片流、图片上传、作者主页和图片详情拆分为独立页面，并通过照片服务统一封装云端数据访问。上传流程同时处理文件和元数据，查询流程处理分页、排序和临时链接，删除流程同时清理数据库记录和云存储文件，形成了较完整的图片生命周期。

本版本适合作为云开发基础实验和多用户图片分享的演示项目。后续可以在当前数据模型上增加点赞、评论、搜索、关注、图片审核、批量上传、图片压缩和更细粒度的云函数鉴权等功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="github提交说明"></a>

## GitHub 提交说明

建议提交以下源码和配置：

```text
.gitignore
README.md
app.js
app.json
app.wxss
package.json
project.config.json
sitemap.json
cloudfunctions/
common/
components/photo-card/
config/
images/icons/about.png
pages/
services/photos/
tests/
utils/
```

不要提交以下内容：

- `node_modules/`
- `miniprogram_npm/`
- `project.private.config.json`
- `lab6.pdf`
- 本机调试截图
- 云数据库导出数据、云存储用户图片和任何密钥

`.gitignore` 已包含这些本地文件和目录的忽略规则。

在项目根目录执行以下命令即可初始化并推送仓库：

```bash
git init
git add .
git commit -m "完成实验 6 图片分享社区"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

请在项目目录 `实验6：微信小程序云开发/` 中执行命令，不要在 `WeChatProjects/` 父目录执行，以免把其他实验项目一并提交。
