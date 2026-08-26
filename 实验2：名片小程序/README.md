<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 2：名片小程序</h2>
  <p align="center">
    中国海洋大学 · 计算机科学与技术专业课程实验代码记录
  </p>
</div>

本项目使用原生 WXML、WXSS 和 JavaScript 构建个人名片页面，包含自定义导航栏、主题切换、简介展开、学习方向切换、信息复制、保存通讯录和 PDF 简历预览等功能。

<!-- 目录 -->

<details>
  <summary>目录 (Table of Contents)</summary>
  <ol>
    <li><a href="#实验目标">实验目标</a></li>
    <li><a href="#开发环境">开发环境</a></li>
    <li><a href="#项目结构">项目结构</a></li>
    <li><a href="#核心实现">核心实现</a></li>
    <li><a href="#运行效果">运行效果</a></li>
    <li><a href="#运行方法">运行方法</a></li>
    <li><a href="#问题与解决方法">问题与解决方法</a></li>
    <li><a href="#实验总结">实验总结</a></li>
  </ol>
</details>

<a id="实验目标"></a>

## 实验目标

1. 完成一个包含头图、个人信息和文字说明的名片小程序。
2. 掌握小程序全局配置文件的基本语法和排错方法。
3. 使用流式布局和状态驱动的视图更新，提升页面在不同尺寸设备上的适配能力。
4. 实现信息复制、学习方向切换、联系人保存和 PDF 文档预览等交互功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>

## 开发环境

- 操作系统：Windows / macOS
- 编程语言：WXML / WXSS / JavaScript / JSON
- 开发工具：微信开发者工具 Stable
- 项目类型：原生微信小程序
- 调试环境：微信开发者工具模拟器及真机
- 基础库版本：3.17.1（以本地开发者工具配置为准）

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>

## 项目结构

```text
实验2：名片小程序/
├── components/
│   └── navigation-bar/
│       ├── navigation-bar.js
│       ├── navigation-bar.json
│       ├── navigation-bar.wxml
│       └── navigation-bar.wxss
├── img/
│   ├── bg.jpg
│   └── self-intro.jpg
├── pages/
│   └── index/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── .eslintrc.js
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── README.md
├── sitemap.json
├── theme.json
```

各类文件的作用如下：

| 文件或目录 | 作用 |
| ---------- | ---- |
| `app.json` | 注册首页，启用自定义导航栏，并声明深色模式和主题配置 |
| `app.wxss` | 定义全局颜色变量、深浅色主题、淡入动画和通用交互样式 |
| `theme.json` | 配置系统导航区域在浅色、深色模式下的颜色 |
| `pages/index/index.wxml` | 描述名片页结构，绑定个人信息、标签页和各类交互事件 |
| `pages/index/index.wxss` | 实现流式布局、卡片视觉、滚动导航栏和响应式样式 |
| `pages/index/index.js` | 管理页面状态，实现主题、手势、复制、通讯录和 PDF 预览逻辑 |
| `components/navigation-bar/` | 保存项目初始化时生成的通用导航栏组件 |
| `img/` | 存放顶部背景图和名片内页图片 |
| `project.config.json` | 保存微信开发者工具使用的项目配置 |

> 首页当前直接在 `index.wxml` 中实现自定义导航栏；`navigation-bar` 组件已保留在工程中，但未在首页实例化。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>

## 核心实现

### 页面状态与数据组织

首页在 `index.js` 中集中维护导航栏、主题、展开状态和当前标签页。个人资料及“算法竞赛”“深度学习”“保研规划”三个方向也通过数据对象统一提供给视图层。

```javascript
Page({
  data: {
    isScrolled: false,
    theme: 'system',
    isExpanded: false,
    currentTab: 0,
    slideDirection: '',
    profile: {
      // 个人信息与学习方向数据
    }
  }
})
```

WXML 使用数据绑定和条件渲染控制扩展区域，页面无需直接操作节点：

```xml
<view class="expand-action" bindtap="toggleExpand">
  <text>{{isExpanded ? '收起' : '展开'}}</text>
</view>

<block wx:if="{{isExpanded}}">
  <view class="expanded-content anim-fade-in">
    <!-- 学习方向、联系方式和操作按钮 -->
  </view>
</block>
```

### 自定义导航栏与流式布局

页面加载时根据状态栏和胶囊按钮位置计算导航高度。页面向下滚动超过 50 px 后，顶部标题由透明状态切换为带背景模糊和阴影的固定导航栏。

主体按“16:9 头图 → 个人信息卡 → 可展开内容”的顺序自然排列，并通过负外边距形成卡片悬浮效果，避免使用固定坐标堆叠内容。

```javascript
onPageScroll(e) {
  if (e.scrollTop > 50 && !this.data.isScrolled) {
    this.setData({ isScrolled: true })
  } else if (e.scrollTop <= 50 && this.data.isScrolled) {
    this.setData({ isScrolled: false })
  }
}
```

### 标签页与滑动手势

展开名片后，可以点击标签切换三个学习方向，也可以在内容区域左右滑动。只有横向位移超过 50 px 时才触发切换，减少页面纵向滚动造成的误触。

标签切换时先清除动画类，再延迟 50 ms 更新内容并添加 `anim-fade-in`，使用透明度动画代替位移和缩放动画，避免横向溢出与残影。

```javascript
onTouchEnd(e) {
  const diff = e.changedTouches[0].clientX - this.touchStartX

  if (Math.abs(diff) > 50) {
    // 根据滑动方向切换相邻标签页
  }
}
```

### 深浅色主题

主题按钮按照“跟随系统 → 浅色 → 深色”的顺序循环切换。WXML 将主题绑定到最外层容器的 `data-theme` 属性，WXSS 再通过 CSS 变量统一调整背景、卡片、文字和强调色。

```css
.page-wrapper[data-theme="dark"] {
  --bg-color: #121212;
  --card-bg: #1C1C1E;
  --text-primary: #F5F5F7;
  --accent-color: #0A84FF;
}

@media (prefers-color-scheme: dark) {
  .page-wrapper[data-theme="system"] {
    --bg-color: #121212;
    --card-bg: #1C1C1E;
  }
}
```

### 平台能力调用

| 功能 | 小程序 API | 说明 |
| ---- | ---------- | ---- |
| 复制简介、GitHub 地址或邮箱 | `wx.setClipboardData` | 将对应文本写入系统剪贴板 |
| 保存联系人 | `wx.addPhoneContact` | 调起系统联系人页面并填入名片信息 |
| 预览 PDF 简历 | `wx.downloadFile`、`wx.openDocument` | 下载远程 PDF 后调用系统文档预览 |
| 分享名片 | `onShareAppMessage` | 提供页面分享信息，能否使用取决于账号和平台权限 |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行效果"></a>

## 运行效果

编译运行后，页面能够完成以下操作：

1. 展示 16:9 头图、姓名、身份、学校、入学年份和个人简介。
2. 展开或收起详细内容，通过点击或左右滑动切换三个学习方向。
3. 在跟随系统、浅色和深色三种主题之间切换。
4. 复制简介、GitHub 地址和邮箱，并调用系统能力保存联系人。
5. 在满足网络和域名配置条件时，下载并打开 PDF 简历。

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/Olivia-183/photos@main/exp2/3%E6%96%B9%E9%9D%A2%E4%BB%8B%E7%BB%8D.jpg" alt="三个学习方向介绍" width="720">
</p>
<p align="center"><strong>三个学习方向介绍</strong></p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/Olivia-183/photos@main/exp2/3%E4%B8%AA%E5%8A%9F%E8%83%BD%E5%92%8C%E6%98%BC%E5%A4%9C%E5%88%87%E6%8D%A2%E6%82%AC%E6%B5%AE%E5%9D%97.jpg" alt="名片功能按钮和主题切换" width="720">
</p>
<p align="center"><strong>功能按钮和主题切换效果</strong></p>

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>

## 运行方法

1. 克隆或下载本代码仓库到本地环境。
2. 打开微信开发者工具，选择“导入项目”。
3. 选择包含 `project.config.json` 的 `实验2：名片小程序` 目录。
4. 根据需要在项目设置中换成自己的 AppID，然后点击“编译”。
5. 在模拟器或真机中测试展开、标签切换、主题切换、复制和通讯录等功能。

```bash
git clone https://github.com/datongyi/Mobile-Software-Development.git
cd Mobile-Software-Development/实验2：名片小程序
```

> PDF 预览依赖外部网络资源。本地调试时可以临时关闭合法域名校验；正式发布前必须在微信公众平台配置合法的下载域名，不能依赖 `urlCheck: false`。

> 不同版本的微信开发者工具可能使用不同渲染环境。若出现空白页或样式异常，请先核对 Skyline / WebView 设置、基础库版本和控制台信息。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：`app.json` 语法错误导致模拟器无法启动

修改全局配置后，控制台曾提示 `Expecting 'EOF'`，模拟器停止渲染。逐行检查后发现上一项末尾缺少英文半角逗号。补全逗号并重新编译后，配置文件恢复正常解析。

### 问题 2：旧教程与当前渲染环境存在差异

早期页面代码在 Skyline 环境中出现过白屏和导航标题不显示的问题。通过对比 Skyline 与 WebView 的运行结果确认了环境差异，随后重新检查项目配置，并将页面重构为流式布局和自定义导航。不同设备上的最终渲染模式应以当前开发者工具配置为准。

### 问题 3：位移动画造成横向滚动条和残影

初版切换效果使用位移和缩放动画，运行时产生了横向溢出和视觉残影。移除相关变换后，改用基于 `opacity` 的 `anim-fade-in` 动画，并在状态切换前后保留 50 ms 间隔，页面切换更加稳定。

### 问题 4：PDF 下载受到合法域名校验限制

调用 `wx.downloadFile` 时，开发者工具曾提示网络超时和下载域名不合法。本地调试阶段通过项目设置临时关闭域名校验完成流程验证；正式发布时仍需配置合法下载域名，并对下载失败和文档打开失败分别给出提示。

### 问题 5：账号权限限制原生分享

项目保留了 `onShareAppMessage` 分享回调，但个人账号的实际分享能力受平台权限和运行环境限制。页面同时提供简介、GitHub 地址和邮箱复制功能，便于在分享入口不可用时手动传递名片信息。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>

## 实验总结

通过本实验，我完成了个人名片小程序的页面设计与交互实现，进一步熟悉了 WXML、WXSS、JavaScript 和 JSON 配置文件之间的分工。项目使用 `setData` 驱动展开状态、标签页和主题变化，并通过流式布局、CSS 变量和手势阈值改善了移动端适配与交互体验。

实验过程中对 `app.json` 语法、渲染环境差异、静态资源路径、动画溢出和下载域名限制进行了排查。这些问题说明，完成页面功能之外，还需要持续核对开发工具版本、平台权限、网络配置和真机表现。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
