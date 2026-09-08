<a id="readme-top"></a>

<!-- 实验标题 -->
<div align="center">
  <h2 align="center">实验 5：个性化科学计算器</h2>
  <p align="center">
    HarmonyOS 应用开发课程实验代码记录
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
    <li><a href="#github-上传范围">GitHub 上传范围</a></li>
    <li><a href="#问题与解决方法">问题与解决方法</a></li>
    <li><a href="#实验总结">实验总结</a></li>
  </ol>
</details>

<a id="项目简介"></a>

## 项目简介

本项目使用 ArkTS 和 ArkUI 开发 HarmonyOS 个性化科学计算器。应用以一个页面承载基础计算、科学计算和单位换算三种工作模式，并通过昼夜主题切换、横竖屏适配和双区按键布局提升操作体验。

除基础四则运算外，项目还实现了连续按等号重复最后一次二元运算、计算历史、记忆运算、科学函数、角度模式、长度与数据等多类别单位换算，以及换算结果带回计算器继续运算等功能。计算逻辑集中在 `CalculatorEngine.ets` 中，页面文件主要负责状态管理、布局和交互响应。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验目标"></a>

## 实验目标

1. 掌握 DevEco Studio 中 HarmonyOS 应用工程的基本结构和模块配置。
2. 使用 ArkTS 和 ArkUI 完成计算器页面布局、状态管理和点击事件处理。
3. 实现基础计算器的四则运算、括号、优先级、百分比和错误处理。
4. 扩展科学计算功能，理解函数解析、角度模式和科学键盘布局的实现方法。
5. 使用窗口方向接口实现科学模式横屏、其他模式竖屏的自适应切换。
6. 实现昼夜主题、计算历史、记忆操作和多类别单位换算等综合功能。
7. 使用 Hypium 单元测试验证表达式计算、重复等号、科学函数、单位换算和异常输入。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="开发环境"></a>

## 开发环境

- 操作系统：Windows
- 开发工具：DevEco Studio 6.x
- 编程语言：ArkTS
- UI 框架：ArkUI
- SDK：HarmonyOS SDK 6.0.2（API 22）
- 构建工具：Hvigor 6.x
- 包管理工具：OHPM
- 测试框架：`@ohos/hypium` 1.0.25
- 测试设备：HarmonyOS 手机模拟器或兼容的 HarmonyOS 真机
- 应用包名：`com.example.lab5`
- 应用版本：`1.0.0`

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="功能列举与简要说明"></a>

## 功能列举与简要说明

| 功能 | 简要说明 |
| ---- | -------- |
| 基础四则运算 | 支持加、减、乘、除、小数、百分比、正负号、括号和运算优先级 |
| 编辑操作 | 支持清空表达式、逐位删除和重新输入 |
| 重复等号 | 对最近一次简单二元运算连续点击等号，自动使用上一次运算符和右操作数继续计算 |
| 计算历史 | 保存当前运行期间最近 10 条计算记录，并支持查看和清空 |
| 记忆运算 | 支持 `MC`、`MR`、`M+`、`M-` 四种记忆操作 |
| 科学幂运算 | 支持 `1/x`、`x²`、`x³`、`xʸ`、`10ˣ` 和 `eˣ` |
| 三角函数 | 支持 `sin`、`cos`、`tan`，通过 `2nd` 切换 `asin`、`acos`、`atan` |
| 双曲函数 | 支持 `sinh`、`cosh`、`tanh`，并支持对应反双曲函数 |
| 对数与常量 | 支持 `log`、`ln`、`π`、`e`、绝对值和随机数 |
| 角度模式 | 支持 DEG、RAD、GRAD 三种角度模式 |
| 科学键盘 | 科学按键与基础按键左右分区显示，进入科学模式自动切换横屏 |
| 昼夜主题 | 支持白天工作台和夜间实验室两种主题，页面颜色即时切换 |
| 长度换算 | 支持毫米、厘米、米、千米、英寸、英尺和英里 |
| 面积换算 | 支持平方米、平方千米、公顷和平方英尺 |
| 质量换算 | 支持毫克、克、千克、吨和磅 |
| 温度换算 | 支持摄氏度、华氏度和开尔文 |
| 时间换算 | 支持秒、分钟、小时和天 |
| 速度换算 | 支持米每秒、千米每小时和英里每小时 |
| 数据换算 | 支持 Byte、KB、MB、GB 和 TB，采用 1024 进制换算 |
| 单位选择 | 点击换算双方的单位按钮，可在当前类别内循环选择单位，数值和单位同步更新 |
| 结果带回 | 将换算结果带回基础计算模式，继续参与后续表达式计算 |
| 异常提示 | 对空表达式、非法字符、除零、定义域错误和无效阶乘显示 `Error` |

> 计算历史、记忆值和昼夜主题保存在当前页面运行状态中。应用重启后不会恢复这些临时状态。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="项目结构"></a>

## 项目结构

```text
lab5/
├── AppScope/
│   ├── app.json5                         # 应用包名、版本和应用图标配置
│   └── resources/                        # 应用级名称和图标资源
├── entry/
│   ├── src/
│   │   ├── main/
│   │   │   ├── ets/
│   │   │   │   ├── common/
│   │   │   │   │   └── CalculatorEngine.ets  # 表达式、科学函数和单位换算引擎
│   │   │   │   ├── entryability/
│   │   │   │   │   └── EntryAbility.ets      # 应用入口和页面加载
│   │   │   │   ├── entrybackupability/
│   │   │   │   │   └── EntryBackupAbility.ets # 系统备份扩展入口
│   │   │   │   └── pages/
│   │   │   │       └── Index.ets             # 页面布局、主题、模式和交互状态
│   │   │   ├── module.json5                  # entry 模块和 Ability 配置
│   │   │   └── resources/                    # 页面、颜色、图标和深色资源
│   │   ├── test/
│   │   │   ├── List.test.ets                 # 本地测试套件入口
│   │   │   └── LocalUnit.test.ets            # 计算引擎单元测试
│   │   └── ohosTest/                         # OpenHarmony 设备测试模板
│   ├── build-profile.json5                   # entry 模块构建配置
│   ├── hvigorfile.ts                         # entry 模块构建脚本
│   ├── oh-package.json5                      # entry 模块依赖配置
│   └── obfuscation-rules.txt                 # 混淆规则文件
├── hvigor/
│   └── hvigor-config.json5                   # Hvigor 工程配置
├── build-profile.json5                       # 应用级构建和 SDK 配置
├── code-linter.json5                         # ArkTS 代码检查配置
├── hvigorfile.ts                             # 应用级构建入口
├── oh-package.json5                          # 工程依赖配置
├── oh-package-lock.json5                     # OHPM 依赖锁定文件
├── .gitignore                                # Git 忽略规则
└── README.md                                 # 项目说明文档
```

| 目录或文件 | 作用 |
| ---------- | ---- |
| `AppScope/` | 保存应用级包名、版本、名称和图标资源 |
| `entry/src/main/ets/pages/Index.ets` | 承载三种模式的 UI、主题切换、横竖屏切换和按钮事件 |
| `entry/src/main/ets/common/CalculatorEngine.ets` | 实现表达式词法分析、递归下降解析、科学函数、重复等号和单位换算 |
| `entry/src/main/ets/entryability/EntryAbility.ets` | 创建窗口并加载 `pages/Index` 页面 |
| `entry/src/main/resources/` | 保存页面路由、颜色、字符串和应用图标资源 |
| `entry/src/test/` | 保存本地 Hypium 测试及测试套件入口 |
| `entry/src/ohosTest/` | 保存设备测试模块的基础测试模板 |
| `build-profile.json5` | 配置产品、目标 SDK、兼容 SDK 和构建模块 |
| `hvigorfile.ts` | 注册 HarmonyOS 应用构建任务 |
| `oh-package-lock.json5` | 锁定 OHPM 依赖版本，保证依赖解析一致 |

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="核心实现"></a>

## 核心实现

### 单页面三模式布局

`Index.ets` 使用 `Mode` 联合类型维护 `BASIC`、`SCI` 和 `CONVERT` 三种模式。顶部模式按钮只改变页面状态，计算表达式、结果、主题和换算数据分别由 `@State` 属性驱动，状态变化后 ArkUI 自动刷新界面。

```typescript
type Mode = 'BASIC' | 'SCI' | 'CONVERT';

@State mode: Mode = 'BASIC';
@State night: boolean = false;
@State expression: string = '';
@State result: string = '0';
```

### 基础计算与重复等号

页面将显示符号映射为解析器使用的运算符，例如将 `×` 和 `÷` 转换为 `*` 和 `/`。点击等号时，首次调用 `evaluate`；如果上一次已经完成计算，则调用 `repeatLast`，继续使用最近一次简单二元运算的右操作数和运算符。

```typescript
const value = this.justEvaluated
  ? CalculatorEngine.repeatLast(this.result, this.angleMode)
  : CalculatorEngine.evaluate(this.expression, this.angleMode);
```

`CalculatorEngine` 使用自定义分词器和递归下降解析器处理表达式，分别在幂运算、乘除法和加减法层处理优先级，不依赖动态执行字符串。

### 科学函数和角度模式

科学模式的按键分为左右两个 `Grid`：左侧显示科学函数，右侧复用基础数字和运算键。点击 `2nd` 后，三角函数和双曲函数按键显示对应反函数。三角函数计算前会根据 DEG、RAD 或 GRAD 将输入转换为弧度。

```typescript
const radians = angleMode === 'DEG'
  ? value * Math.PI / 180
  : (angleMode === 'GRAD' ? value * Math.PI / 200 : value);
```

### 横竖屏适配

切换到科学模式时，页面通过 `window.Window.setPreferredOrientation` 请求横屏；切换回基础模式或换算模式时请求竖屏。科学模式的短按键高度和双区布局可以在横屏窗口中一次展示完整按键。

```typescript
mainWindow.setPreferredOrientation(
  landscape ? window.Orientation.LANDSCAPE : window.Orientation.PORTRAIT
);
```

### 昼夜主题

`night` 状态统一控制页面背景、文字、按钮和结果区域颜色。白天主题使用纸面工作台配色，夜间主题使用深色背景和青色高亮，切换按钮位于页面顶部。

```typescript
backgroundColor(this.night ? '#111827' : '#f5f1e8')
```

### 记忆与历史

记忆值由页面中的 `memory` 数字状态维护。`MC` 清零，`MR` 追加当前记忆值，`M+` 和 `M-` 分别累加或扣减当前结果。每次成功计算后，将表达式和结果插入历史数组，并截取最新 10 条记录。

### 单位换算

换算页维护当前类别、输入值、来源单位和目标单位。长度、面积、质量、时间、速度和数据类别通过基准单位因子换算，温度类别单独使用摄氏度作为中间值处理。左右单位按钮始终从当前类别的单位列表中循环选择，并在状态更新后重新计算结果。

```typescript
this.convertResult = CalculatorEngine.convertUnit(
  Number(this.convertInput),
  this.convertCategory,
  this.convertFrom,
  this.convertTo
);
```

### 单元测试

`LocalUnit.test.ets` 使用 Hypium 验证以下核心行为：

- 乘除法优先级；
- 连续按等号重复二元运算；
- DEG 模式下的 `sin(90)`；
- 摄氏度到华氏度的换算；
- 除零时返回 `Error`；
- 基础断言和测试套件注册。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行效果"></a>

## 运行效果

编译运行后，应用能够完成以下操作：

1. 默认进入基础计算模式，以竖屏四列键盘输入表达式并查看结果。
2. 连续点击等号，继续执行上一次简单二元运算；点击 `History` 查看最近记录。
3. 使用 `MC`、`MR`、`M+` 和 `M-` 保存或调用中间结果。
4. 切换到科学模式后自动横屏，左右两侧同时显示科学按键和基础数字键。
5. 点击 `2nd` 切换三角函数或双曲函数的反函数，并使用角度模式计算结果。
6. 切换昼夜主题，观察背景、按钮、文字和结果区域同步变化。
7. 打开换算模式，选择长度、面积、质量、温度、时间、速度或数据类别。
8. 输入数值并点击任一单位按钮，双方单位和换算结果同步更新。
9. 点击“使用结果”返回基础计算模式，将换算结果继续用于表达式计算。
10. 输入非法表达式、除零表达式或超出定义域的科学函数时显示 `Error`。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="运行方法"></a>

## 运行方法

1. 克隆或下载代码仓库。
2. 使用 DevEco Studio 打开包含 `build-profile.json5` 的 `lab5` 根目录，不要只打开 `entry` 子目录。
3. 等待 OHPM 依赖同步完成，确认设备类型选择为手机。
4. 连接 HarmonyOS 模拟器或真机，在顶部设备列表中选择目标设备。
5. 点击运行按钮启动应用，使用顶部模式按钮体验基础计算、科学计算和单位换算。

在已配置 DevEco Studio 命令行环境的终端中，也可以执行：

```powershell
ohpm install
hvigorw.bat assembleApp --no-daemon
```

未配置签名时，构建会生成未签名 HAP：

```text
entry/build/default/outputs/default/entry-default-unsigned.hap
```

本地测试文件位于 `entry/src/test/LocalUnit.test.ets`。在 DevEco Studio 中打开该文件，使用测试运行入口执行 Hypium 测试；设备测试模板位于 `entry/src/ohosTest/`。

正式发布前，需要在 `build-profile.json5` 中配置签名证书和签名方案。未配置签名不会影响模拟器中的开发调试构建。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="问题与解决方法"></a>

## 问题与解决方法

### 问题 1：科学计算器按键无法一次完整显示

科学按键数量较多，如果继续使用竖屏单列布局，底部按键会超出窗口。项目将科学键盘和基础键盘分别放入左右两个 `Grid`，并在进入科学模式时主动请求横屏，同时降低科学按键高度，使所有按键在同一窗口内可见。

### 问题 2：切换模式后屏幕方向没有恢复

窗口方向属于 Ability 窗口状态，不能只依赖页面布局刷新。项目在模式按钮回调中统一调用 `setOrientation`，科学模式传入横屏，基础和换算模式传入竖屏；如果当前环境不支持方向请求，则在页面底部显示提示信息。

### 问题 3：科学函数输入需要处理不同角度单位

三角函数底层 `Math.sin`、`Math.cos` 和 `Math.tan` 使用弧度。引擎在执行函数前根据 DEG、RAD、GRAD 将输入转换为弧度，反三角函数返回角度值，从而保持界面角度模式的一致性。

### 问题 4：不能直接使用字符串动态执行表达式

为了统一运算优先级并避免依赖动态执行，`CalculatorEngine.ets` 自己完成分词和递归下降解析。解析器分别处理括号、单目正负号、阶乘、幂、乘除和加减，并在结果不是有限数字时返回 `Error`。

### 问题 5：连续按等号需要记住上一次运算

普通表达式求值完成后，只有符合“数字 + 运算符 + 数字”形式的简单二元表达式才会记录右操作数和运算符。下一次点击等号时，以当前显示结果作为左操作数继续计算；复杂表达式不会错误套用旧运算。

### 问题 6：换算双方单位切换后显示不同步

换算页将类别、来源单位、目标单位、输入值和结果分别作为页面状态保存。切换类别时先重置为该类别的前两个单位，点击任一单位按钮时只在当前类别列表中循环，并立即调用 `updateConversion`，因此单位文字、数值和结果来自同一组状态。

### 问题 7：构建时提示未配置签名

实验工程默认不包含个人签名证书，Hvigor 会跳过签名并输出未签名 HAP。这是开发构建的正常提示；在真机发布或上传应用市场前，需要在 DevEco Studio 中配置签名方案，不应把个人签名文件提交到 GitHub。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<a id="实验总结"></a>

## 实验总结

通过本实验，我完成了一个基于 ArkTS 和 ArkUI 的个性化科学计算器。项目从基础四则运算出发，扩展了优先级解析、重复等号、记忆和历史功能，并进一步加入科学函数、角度模式、横屏双区键盘和多类别单位换算。

在界面实现方面，我使用单页面状态驱动三种工作模式，通过窗口方向接口解决科学按键空间不足的问题，并使用昼夜主题改变工作台的视觉风格。在逻辑实现方面，我将表达式解析和单位换算集中到 `CalculatorEngine.ets`，让页面只负责输入、状态和显示，降低了 UI 代码与计算逻辑之间的耦合。

本项目采用本地运行状态，适合作为课程实验和单设备演示。后续如果继续完善，可以增加计算记录持久化、真正的系统剪贴板复制、更多科学函数、国际化单位名称和发布签名配置；这些内容不属于本次实验的必要范围。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
