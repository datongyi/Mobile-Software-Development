<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 1：第一个微信小程序</h2>
  <p align="center">
    中国海洋大学 · 计算机科学与技术专业课程实验代码记录
  </p>
</div>
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

列出本次实验的主要学习目标与任务要求：
1. 熟悉微信开发者工具中新建、导入和编译小程序项目的基本流程。
2. 掌握不使用模板手动创建小程序所需文件的方法。
3. 理解 WXML、WXSS、JavaScript 和 JSON 配置文件的基本职责。
4. 使用数据绑定、条件渲染和事件处理，实现动态的专属问候语和图片显隐切换。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>
## 开发环境

- 操作系统：Windows / macOS
- 编程语言：WXML / WXSS / JavaScript
- 开发工具：微信开发者工具 Stable
- 运行环境：微信开发者工具模拟器

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>
## 项目结构

```text
Mobile-Software-Development/
├── components/
│   └── navigation-bar/
├── img/
│   ├── bg.jpg
│   └── lab1.png
├── pages/
│   └── index/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── project.private.config.json
└── sitemap.json
```

各类文件的作用如下：

| 文件类型              | 作用                                                         |
| --------------------- | ------------------------------------------------------------ |
| `app.json`            | 注册小程序页面并配置导航栏、背景颜色等全局界面属性           |
| `app.js`              | 声明小程序实例并保存全局数据                                 |
| `app.wxss`            | 定义所有页面共用的基础样式                                   |
| `index.wxml`          | 描述首页骨架结构，绑定页面数据并根据状态切换按钮、问候语和图片显隐 |
| `index.wxss`          | 设置首页布局、颜色、字号和按钮交互样式                       |
| `index.js`            | 定义首页初始数据，编写输入框捕获、文字切换和图片显隐的事件逻辑 |
| `project.config.json` | 小程序项目核心配置文件                                       |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>
## 核心实现

### 数据结构与模块设计

在 `index.js` 中定义页面的初始状态，包括问候语变量和控制图片显隐的布尔值：

```javascript
Page({
  data: {
    wording: 'world',
    showImg: true
  },
  // ...
})
```

在 `index.wxml` 中使用双花括号进行数据绑定，并使用 `wx:if` 指令控制图片组件：

```html
<view class="title">hello {{wording}}!</view>
<image wx:if="{{showImg}}" class="lab-image" mode="widthFix" src="../../img/lab1.png"></image>
```

### 核心算法与逻辑处理

在 `index.js` 中编写对应的事件处理函数。例如输入框的实时捕获逻辑和点击交互逻辑：

```javascript
// 捕获输入框内容，实现专属问候
onInput: function (e) {
  let inputValue = e.detail.value;
  if (inputValue === '') {
    inputValue = 'world'; // 清空时回退默认值
  }
  this.setData({
    wording: inputValue
  })
},

// 切换文字逻辑
onClick: function () {
  let currentWording = this.data.wording;
  this.setData({
    wording: currentWording === 'world' ? 'boy' : 'world'
  })
},

// 切换图片显隐逻辑
toggleImg: function () {
  this.setData({
    showImg: !this.data.showImg
  })
}
```

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行效果"></a>
## 运行效果

编译并运行项目后，模拟器成功渲染了带背景图的实验首页：
1. 在输入框键入名字，顶部的问候语会实时从 "hello world!" 变为 "hello [名字]!"，体现了双向绑定的有效性。
2. 点击绿色的“点击切换”按钮，文字会在 "world" 和 "boy" 之间顺利循环切换。
3. 点击蓝色的“显示/隐藏图片”按钮，中央的实验截图会即刻消失与恢复。
整体运行流畅，交互逻辑正确，控制台无报错。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>
## 运行方法

1. 克隆或下载本代码仓库到本地环境。
2. 打开微信开发者工具，选择“导入项目”。
3. 选择包含 `project.config.json` 的项目根目录进行导入。
4. 导入时使用自己的 AppID。
5. 点击顶部菜单的“编译”按钮，即可在右侧模拟器中查看并体验运行效果。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：底层网络报错 `41001`
开发中途控制台报错 `Error: 41001... access_token err_code: missing`。
**解决方法**：经排查发现当前使用了无云端权限的测试号。前往微信公众平台网页端获取正式注册的小程序 AppID，并在开发者工具的“详情-基本信息”栏替换后，报错消除。

### 问题 2：静态图片无法显示
编写完 `wx:if` 的图片组件代码后，模拟器中图片位置显示空白。
**解决方法**：检查文件目录发现本地截图默认后缀为 `.jpg`，而 WXML 代码路径中写成了 `.png`。统一后缀名后，图片正常渲染。

### 问题 3：本地配置文件查找困难
在进行项目迁移并需要修改项目名称时，未能在常规的 `project.config.json` 中找到对应的项目名字段。
**解决方法**：查阅文档与分析目录结构，发现项目名与 AppID 等敏感信息被单独拆分并存放于私有配置文件 `project.private.config.json` 中，在此修改后成功生效。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>
## 实验总结

通过本实验，我完成了第一个原生微信小程序的开发与编写，并对不同模块或文件的职责有了初步认识。该实验帮助我巩固了 WXML 视图层与 JS 逻辑层的分离思想，提升了遇到底层报错时的排查能力。通过动手实现输入捕获和点击交互，我更为清晰地理清了小程序中“数据变化驱动视图更新”（即 `setData`）的核心运转机制。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
