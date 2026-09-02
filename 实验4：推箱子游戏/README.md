<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 4：推箱子游戏</h2>
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
    <li><a href="#素材来源与版权说明">素材来源与版权说明</a></li>
    <li><a href="#问题与解决方法">问题与解决方法</a></li>
    <li><a href="#实验总结">实验总结</a></li>
  </ol>
</details>

<a id="项目简介"></a>

## 项目简介

本项目使用原生 WXML、WXSS、JavaScript 和 JSON 开发推箱子微信小程序。小程序包含关卡选择、游戏和通关结果三个页面，使用 Canvas 绘制地图、墙体、箱子、目标点和玩家角色。

项目在课程实验基础功能之上扩展到 60 个关卡，并增加方向键与棋盘滑动操作、连续撤销、暂停计时、本地断点续玩、最佳成绩、星级评价、关卡解锁和六类游戏音效。所有进度与设置均保存在微信本地缓存中，不需要配置云开发环境。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验目标"></a>

## 实验目标

1. 掌握微信小程序多页面项目的组织方式和页面跳转方法。
2. 使用 Canvas 完成二维棋盘、角色、箱子、墙体和目标点的绘制。
3. 实现推箱子的角色移动、碰撞判断、箱子推动和通关判断逻辑。
4. 使用页面数据绑定展示当前关卡、移动步数、挑战用时和暂停状态。
5. 使用微信本地缓存保存关卡进度、最佳成绩、音效设置和未完成局面。
6. 完成撤销、滑动控制、音效反馈、通关结算和关卡解锁等综合功能。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>

## 开发环境

- 操作系统：Windows / macOS
- 编程语言：WXML / WXSS / JavaScript / JSON
- 开发工具：微信开发者工具 Stable
- 基础库版本：以 `project.config.json` 为准
- 测试环境：微信开发者工具模拟器
- 逻辑测试：Node.js 内置测试模块 `node:test`
- 数据来源：本地推箱子地图文件与微信本地缓存

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="功能列举与简要说明"></a>

## 功能列举与简要说明

| 功能 | 简要说明 |
| ---- | -------- |
| 60 个关卡 | 从本地地图素材导入 60 张推箱子地图，并按难度顺序编号 |
| 关卡选择 | 使用每行 4 个正方形按钮展示关卡，共 15 行；可挑战关卡显示关号，未解锁关卡显示灰色锁图标 |
| 顺序解锁 | 默认开放第 1 关，完成当前关卡后自动解锁下一关，第 60 关为最终关卡 |
| Canvas 棋盘 | 根据地图行列数计算画布尺寸，使不同比例的地图保持正方形格子并适应屏幕 |
| 方向键操作 | 提供上、下、左、右四个方向按钮控制玩家移动 |
| 棋盘滑动 | 在棋盘区域滑动时，根据主要滑动方向执行对应移动 |
| 碰撞与推动 | 玩家不能穿过墙体或禁区；箱子后方存在墙体或其他箱子时不能继续推动 |
| 连续撤销 | 默认保留最近 5 个有效移动状态，可连续恢复玩家、箱子和步数 |
| 暂停与继续 | 暂停后停止计时并禁用移动操作，继续后恢复计时 |
| 步数与用时 | 游戏页面实时显示有效移动步数和当前挑战时间 |
| 断点续玩 | 离开或关闭小程序时保存未完成局面，再次进入相同关卡时恢复箱子、角色、步数、用时和撤销记录 |
| 最佳成绩 | 分别保存每个关卡的最少步数、最短用时和最高星级 |
| 星级评价 | 根据本次移动步数和关卡基准步数计算 1 至 3 星评价 |
| 游戏音效 | 为普通移动、推箱、箱子到达目标、撤销、无效移动和通关提供独立音效 |
| 音效开关 | 首页可统一启用或关闭所有游戏音效，设置会保存到本地缓存 |
| 通关结果 | 展示本次步数、本次用时、最佳步数、最佳用时和星级 |
| 结果页导航 | 支持进入下一关、再玩一次或返回关卡选择页面 |

> 关卡进度、最佳成绩、未完成局面和音效设置均只保存在当前设备或开发者工具的本地缓存中，不会同步到其他设备。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>

## 项目结构

```text
实验4：推箱子游戏/
├── components/
│   └── navigation-bar/       # 自定义导航栏组件
├── images/
│   ├── icons/                # 墙体、地板、箱子、玩家和目标点素材
│   ├── level01.png
│   ├── level02.png
│   ├── level03.png
│   └── level04.png
├── maps/
│   └── sokoban-maps-60-plain.txt  # 60 关原始地图素材
├── pages/
│   ├── index/                # 关卡选择、完成进度和音效开关
│   ├── game/                 # Canvas 棋盘、操作、计时和断点保存
│   └── result/               # 通关成绩、星级和页面导航
├── sound_effects/
│   ├── bloops.wav            # 箱子到达目标音效
│   ├── invalid.wav           # 无效移动音效
│   ├── sfx1.wav              # 通关音效
│   ├── squeak.wav            # 普通移动音效
│   ├── thump.wav             # 推箱音效
│   └── whoosh.wav            # 撤销音效
├── scripts/
│   └── generate-levels.js    # 根据地图文本生成运行时关卡数据
├── tests/
│   ├── game-engine.test.js
│   ├── game-page.test.js
│   ├── map-parser.test.js
│   ├── page-helpers.test.js
│   ├── progress.test.js
│   ├── sound.test.js
│   ├── storage.test.js
│   └── validator.test.js
├── utils/
│   ├── game-engine.js        # 移动、推动、撤销、重开和通关判断
│   ├── levels.js             # 60 关运行时数据
│   ├── map-parser.js         # 地图文本解析与字符转换
│   ├── page-helpers.js       # 时间格式、滑动方向和棋盘尺寸计算
│   ├── progress.js           # 关卡进度辅助逻辑
│   ├── sound.js              # 六类音效资源映射与播放管理
│   ├── storage.js            # 本地进度、断点、成绩和设置存储
│   └── validator.js          # 地图结构校验
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── sitemap.json
└── README.md
```

| 目录或文件 | 作用 |
| ---------- | ---- |
| `pages/index/` | 展示 60 个关卡按钮、完成数量和音效开关，并限制未解锁关卡进入 |
| `pages/game/` | 管理当前游戏状态、Canvas 绘制、计时、暂停、滑动、撤销、音效和断点保存 |
| `pages/result/` | 记录通关结果，展示本次与最佳成绩，并提供下一关、重玩和返回选关操作 |
| `utils/game-engine.js` | 实现与页面无关的推箱子核心规则，便于独立测试 |
| `utils/map-parser.js` | 将地图素材转换为引擎使用的墙体、地板、目标、箱子和玩家字符 |
| `utils/storage.js` | 使用统一缓存键保存解锁进度、成绩、当前局面和设置 |
| `utils/sound.js` | 管理六种游戏事件与音效资源之间的映射 |
| `tests/` | 使用 Node.js 断言验证地图、引擎、存储、音效和页面交互逻辑 |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>

## 核心实现

### 地图数据与图层分离

地图使用字符表示不同格子。墙体、普通地板和目标点组成静态层，玩家与箱子组成动态层。移动角色或箱子时只需更新动态数据，不会破坏目标点信息。

```javascript
function createGame(level) {
  const parsed = parseLevel(level)
  return {
    levelId: level.id,
    staticLayer: parsed.staticLayer,
    player: parsed.player,
    boxes: parsed.boxes,
    initial: parsed.initial,
    moves: 0,
    history: []
  }
}
```

### 移动、推箱与胜利判断

每次操作先计算玩家目标位置。如果目标位置是墙体或禁区，则移动无效；如果目标位置存在箱子，还需要继续判断箱子后方是否可以进入。

```javascript
function isWon(state) {
  return state.boxes.every(
    (box) => state.staticLayer[box.row]?.[box.col] === 'o'
  )
}
```

当所有箱子都位于目标点时，停止计时、播放通关音效、清除当前断点，并携带关卡、步数和用时进入结果页。

### 连续撤销

每次有效移动前保存一份局面快照，并只保留最近 5 个状态。撤销时取出最后一个快照，恢复角色、箱子和步数。

```javascript
next.history = [...state.history, snapshot(state)].slice(-5)
```

这种实现不需要反向计算移动过程，可以完整恢复推箱前的状态。

### 计时、暂停与继续

游戏页面使用定时器累计挑战时间。暂停时清除定时器并保存当前局面，同时禁止方向键和滑动操作；继续后重新启动计时器。

```javascript
togglePause() {
  const paused = !this.data.paused
  this.setData({ paused })
  if (paused) {
    this.stopTimer()
    this.saveCurrentGame()
  } else {
    this.startTimer()
  }
}
```

页面隐藏或卸载时也会停止定时器并保存断点，避免后台继续计时。

### 方向键与滑动控制

方向按钮通过 `data-direction` 传递方向。棋盘滑动则比较横向和纵向位移，根据距离更大的轴确定移动方向，过短的滑动会被忽略。

```javascript
function directionFromSwipe(start, end, threshold = 24) {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return null
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? 'right' : 'left'
  return deltaY > 0 ? 'down' : 'up'
}
```

### 本地进度与断点续玩

项目使用 `boxGameProgressV2` 作为统一缓存键，避免多个缓存项之间出现状态不一致。

```javascript
{
  unlocked: 1,
  completed: {},
  best: {},
  current: null,
  settings: { sound: true }
}
```

- `unlocked`：当前已解锁的最高关卡。
- `completed`：已完成关卡集合。
- `best`：每关最佳步数、最佳用时和最高星级。
- `current`：未完成关卡的局面、历史、步数和用时。
- `settings.sound`：音效总开关。

结果记录会分别比较步数和用时，因此新的通关记录可以只更新其中一项最佳成绩。

### 六类音效

音效模块根据游戏事件选择对应资源，并在播放前读取当前音效设置。

```javascript
const SOUND_SOURCES = {
  move: '/sound_effects/squeak.wav',
  push: '/sound_effects/thump.wav',
  goal: '/sound_effects/bloops.wav',
  undo: '/sound_effects/whoosh.wav',
  invalid: '/sound_effects/invalid.wav',
  win: '/sound_effects/sfx1.wav'
}
```

关闭音效后，移动、推箱、撤销、撞墙和通关均不会调用音频播放接口。

### 通关结果与关卡解锁

结果页根据本次成绩更新本地记录，显示本次步数、本次用时、最佳步数、最佳用时和星级。完成第 1 至 59 关时解锁下一关，完成第 60 关后不再增加关卡编号。

结果页提供以下三个操作：

1. “下一关”：进入下一已解锁关卡。
2. “再玩一次”：重新开始当前关卡。
3. “返回选关”：返回 60 关选择页面。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行效果"></a>

## 运行效果

编译运行后，小程序能够完成以下操作：

1. 首页以 4 列、15 行的正方形按钮展示 60 个关卡。
2. 点击已解锁关卡进入游戏，点击灰色锁定关卡时提示先完成上一关。
3. 游戏页面根据地图比例自动调整 Canvas 棋盘尺寸。
4. 使用方向键或在棋盘上滑动控制角色移动和推动箱子。
5. 实时查看移动步数和挑战用时，并可暂停、继续或重新开始。
6. 连续撤销最近 5 次有效移动，恢复对应的角色、箱子和步数状态。
7. 普通移动、推箱、到达目标、撤销、无效移动和通关时播放不同音效。
8. 关闭音效开关后保持静音，并在重新进入小程序后保留该设置。
9. 离开未完成关卡后再次进入，可恢复原局面、步数、用时和撤销记录。
10. 完成关卡后进入结果页，查看本次成绩、最佳成绩和星级。
11. 从结果页进入下一关、重新挑战当前关卡或返回关卡选择页面。

<p align="center">
  <img src="images/level01.png" alt="推箱子关卡素材示例" width="420">
</p>

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>

## 运行方法

1. 克隆或下载代码仓库到本地环境。
2. 打开微信开发者工具，选择“导入项目”。
3. 选择包含 `project.config.json` 的 `实验4：推箱子游戏` 目录。
4. 根据需要将项目 AppID 替换为自己可使用的小程序 AppID。
5. 点击顶部菜单中的“编译”，在模拟器或真机中体验游戏。

```bash
git clone https://github.com/datongyi/Mobile-Software-Development.git
cd "Mobile-Software-Development/实验4：推箱子游戏"
```

如需运行核心逻辑测试，请在安装了 Node.js 的终端中执行：

```bash
node --test tests/*.test.js
```

如修改了 `maps/sokoban-maps-60-plain.txt`，可重新生成运行时关卡数据：

```bash
node scripts/generate-levels.js
```

> 游戏进度、成绩、未完成局面和音效设置均保存在微信本地缓存中。清除开发者工具缓存或更换设备后，这些数据不会保留。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="素材来源与版权说明"></a>

## 素材来源与版权说明

本项目为《移动软件开发》课程实验作品。仓库中的程序代码、课程指导内容和外部素材具有不同的来源与权利归属，说明如下。

| 内容 | 项目内位置 | 来源与使用说明 |
| ---- | ---------- | -------------- |
| 课程实验指导 | 实验要求及项目功能设计 | 项目依据《移动软件开发》实验 4 的课程指导材料完成。指导材料仅作为课程学习依据，其著作权及相关权利归原作者或课程提供方所有，本仓库不对其主张权利。 |
| 60 关地图数据 | `maps/sokoban-maps-60-plain.txt` | [sokoban-maps/maps at master · begoon/sokoban-maps](https://github.com/begoon/sokoban-maps/tree/master/maps) |
| 游戏图片素材 | `images/` | 《移动软件开发》实验 4 的课程指导材料。 |
| 游戏音效素材 | `sound_effects/` | https://opengameart.org/content/18-random-video-game-sound-effects |

上述来源待核实的地图、图片和音效仅用于课程学习、实验演示与功能验证。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：地图内部空格被错误识别为禁区

推箱子文本地图中的空格同时可能表示“墙外空白”和“墙内可行走地板”。如果直接把所有空格转换为禁区，玩家会被困在初始位置。

解析地图时从矩形边界开始搜索与外部连通的空格，将这些位置保留为禁区；被墙体包围的内部空格则转换为普通地板。这样既能保持地图外形，也能保证内部通道正常移动。

### 问题 2：不同地图的长宽比例差异较大

60 个关卡并非固定的正方形地图。如果直接使用固定宽高绘制，会导致格子拉伸或地图超出屏幕。

项目根据地图列数、行数和当前屏幕可用区域计算统一格子尺寸，再得到实际画布宽高，使每个格子保持正方形，并让横向或纵向地图都能完整显示。

### 问题 3：撤销后目标点状态可能丢失

如果将墙体、目标、角色和箱子全部保存在同一个可变数组中，推动箱子和撤销时容易覆盖目标点。

项目将墙体、地板和目标点保存在静态层，将玩家和箱子保存在动态层。撤销只恢复动态局面，目标点始终保留在静态层中。

### 问题 4：暂停或离开页面后计时仍然增长

只在点击暂停按钮时更新文字状态，并不能真正停止计时器；页面进入后台后继续运行还会造成用时不准确。

项目在暂停、页面隐藏和页面卸载时统一清除计时器，在继续或重新显示页面时按状态重新启动，并防止创建重复定时器。

### 问题 5：通关后断点与结果记录相互冲突

如果进入结果页前仍保留当前局面，用户返回选关后可能看到已经通关的关卡仍标记为可继续。

项目在确认胜利后先停止计时并清除未完成断点，再由结果页记录最佳成绩和解锁状态，使“当前局面”和“已通关成绩”的职责保持分离。

### 问题 6：本地记录无法跨设备同步

关卡进度和成绩全部使用本地缓存实现，只适合课程实验和单设备体验。若需要登录后跨设备同步，可将进度数据迁移到微信云开发数据库或独立服务端，并增加用户身份校验。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>

## 实验总结

通过本实验，我完成了一个包含关卡选择、游戏过程和通关结果页面的原生微信小程序，并进一步掌握了 Canvas 绘制、触摸事件、页面生命周期、定时器、本地缓存和多页面导航的使用方法。项目从基础的角色移动、箱子推动和通关判断，扩展到 60 个关卡、双操作方式、连续撤销、暂停计时、音效反馈、断点续玩、最佳成绩和星级评价，形成了较完整的推箱子游戏流程。

开发过程中，我将地图解析、游戏引擎、页面辅助、音效和本地存储拆分为独立模块。游戏规则不依赖页面组件，可以使用 Node.js 测试验证移动、碰撞、撤销和胜利条件；页面主要负责输入处理、Canvas 绘制和生命周期协调。这种结构降低了各部分之间的耦合，也便于继续增加地图或调整界面。

本项目目前使用本地地图、图片、音效和缓存，适合稳定演示课程要求。如果继续完善，可以增加关卡分组、排行榜、云端进度同步、自定义地图编辑器和更多无障碍操作方式。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
