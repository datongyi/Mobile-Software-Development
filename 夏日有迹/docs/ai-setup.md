# AI 笔友本地配置

核心手账不依赖 AI。真实回信可使用 DeepSeek、OpenAI 官方接口，或采用 Bearer 密钥和 Chat Completions 协议的 OpenAI 兼容中转。密钥可能产生费用；不要把密钥发给他人、粘贴到小程序源码或提交到 GitHub。

## 1. 需要准备什么

使用任何服务都需要确认三项信息：

- API 密钥：官方平台或中转平台发放的完整密钥，不要加 `Bearer ` 前缀。
- 接口地址：官方接口或中转文档给出的 Base URL；项目也接受完整的 `/chat/completions` 地址。
- 模型 ID：必须与该密钥实际可用的模型名完全一致。中转页面展示的昵称不一定等于 API 模型 ID。

OpenAI 官方密钥可在 [OpenAI API Keys](https://platform.openai.com/api-keys) 创建。ChatGPT Plus/Pro 订阅与 API 额度是两套计费体系，拥有 ChatGPT 订阅不代表 API 自动可用。DeepSeek 密钥可在 [DeepSeek 开放平台](https://platform.deepseek.com/) 创建。

使用第三方中转时，密钥、余额、日志保留和数据处理均由该中转控制。日记正文会发送给该服务，演示私人内容前先确认其可信度和隐私条款。

## 2. 创建本地配置

在 PowerShell 中进入下载后的项目根目录并复制示例：

```powershell
Copy-Item server\.env.example server\.env
notepad server\.env
```

三套配置选择一套填写。

### DeepSeek

```dotenv
AI_PROVIDER=deepseek
AI_API_KEY=你的DeepSeek密钥
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-flash
AI_JSON_MODE=on
AI_MAX_TOKENS_FIELD=max_tokens
PORT=8787
```

如果该模型名不对你的账户开放，以 DeepSeek 控制台或官方文档列出的精确模型 ID 替换 `AI_MODEL`。

### OpenAI 官方 GPT

```dotenv
AI_PROVIDER=openai
AI_API_KEY=你的OpenAI_API密钥
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
AI_JSON_MODE=on
AI_MAX_TOKENS_FIELD=max_tokens
PORT=8787
```

`gpt-4.1-mini` 是配置示例。请以你的 OpenAI 项目实际可用模型为准；如果接口提示 `max_tokens` 不受支持，将 `AI_MAX_TOKENS_FIELD` 改为 `max_completion_tokens`。

### OpenAI 兼容 GPT 中转

```dotenv
AI_PROVIDER=compatible
AI_API_KEY=中转平台发放的密钥
AI_BASE_URL=https://你的中转域名/v1
AI_MODEL=中转平台提供的精确模型ID
AI_JSON_MODE=on
AI_MAX_TOKENS_FIELD=max_tokens
PORT=8787
```

中转除了密钥，通常还必须修改 `AI_BASE_URL` 和 `AI_MODEL`。如果文档给的是完整地址，例如 `https://example.com/v1/chat/completions`，可直接填写；代理不会重复追加路径。

本项目支持标准 `Authorization: Bearer <key>` 和 Chat Completions 响应结构。若中转要求自定义鉴权头、Responses API 或私有响应格式，它不属于当前兼容范围。中转不支持 `response_format` 时，将 `AI_JSON_MODE=off`；系统仍会通过提示词要求 JSON，并继续校验返回结果。

注意：

- 等号两侧不要加空格，不要使用中文引号。
- `server/.gitignore` 已排除 `.env` 和 `.env.*`，提交前仍应检查一次。
- 旧的 `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL` 仍兼容，但新配置统一推荐使用 `AI_*`。
- 修改 `.env` 后必须重启代理才会生效。

## 3. 启动并检查代理

在项目根目录运行：

```powershell
node --version
npm run proxy
```

成功后终端会持续显示：

```text
Summer Traces AI proxy: http://127.0.0.1:8787
```

保持该终端运行。另开一个 PowerShell 检查：

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
```

正确结果会包含：

```text
ok            : True
configured    : True
provider      : compatible
providerLabel : GPT 兼容中转
model         : 你填写的模型ID
```

健康检查不会返回密钥或中转完整地址。`configured: False` 时查看 `detail`；常见原因是缺少密钥、接口地址或模型名。

## 4. 配置微信开发者工具

本地代理默认只服务电脑模拟器：

1. 打开项目，进入“详情 → 本地设置”。
2. 仅在本地调试时开启“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”。
3. 重新编译小程序。
4. 打开“我的 → AI 笔友”，代理地址填写 `http://127.0.0.1:8787`。
5. 点击“保存地址”，再点击“检查连接”。页面会显示实际服务商和模型。

这项域名开关只适用于本地开发。正式发布必须部署 HTTPS 服务，并在微信公众平台配置合法域名。

## 5. 生成第一封回信

1. 保存至少一篇日记。
2. 从详情页点击“请笔友回信”，或从灵感页进入“夏日笔友”。
3. 选择模式、语气和记录，点击“寄出并生成回信”。
4. 阅读发送确认框。确认后只发送所选记录的标题、正文和日期，不发送照片、心情、标签或账户名。

生成结果先展示。标题、标签和情绪色只有点击“采纳建议”后才会写入，并可撤销；原正文不会被 AI 覆盖。

## 6. 常见错误

| 页面提示 | 原因与处理 |
| --- | --- |
| AI 服务配置不完整 | 检查 `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`，保存后重启代理 |
| 密钥无效 | 确认使用该官方/中转平台发放的密钥，没有遗漏字符、空格或 `Bearer ` 前缀 |
| 余额不足 | 在对应官方或中转平台检查 API 余额和计费状态 |
| 请求频繁 | 等待后手动重试；项目不会自动重复付费请求 |
| 服务暂时不可用 | 核对中转 Base URL、模型 ID、服务状态和代理终端信息 |
| AI 返回格式不完整 | 尝试保持 `AI_JSON_MODE=on`；若中转不支持该参数则改为 `off` 后重启 |
| 参数 `max_tokens` 不受支持 | 改为 `AI_MAX_TOKENS_FIELD=max_completion_tokens` 后重启 |
| 等候超时 | 网络或上游超过 45 秒；确认代理仍运行后手动重试 |
| 无法连接笔友 | 检查本地代理、端口、开发者工具域名校验和 Network 面板 |

需要确认请求时，可在微信开发者工具 Network 面板查找 `POST /api/reply`。不要截图或公开包含正文的请求体。

## 安全与运行边界

- 密钥只由电脑上的 Node.js 代理读取，小程序端不保存密钥。
- 代理只监听 `127.0.0.1`，拒绝非本机 Host 和带浏览器 Origin 的请求。
- 远程 `AI_BASE_URL` 必须是 HTTPS；只有 `localhost` 和 `127.0.0.1` 中转允许 HTTP。
- 请求体最多 90000 字节，所选正文合计最多 18000 字；同时最多两个生成请求。
- 代理超时 45 秒，小程序超时 50 秒；取消请求不保证撤销上游已经产生的 token 费用。
- 手机上的 `localhost` 指手机自身。本配置面向电脑微信开发者工具模拟器，不能直接作为真机或正式发布方案。
- 仓库不提供公共密钥。可以先运行自动测试验证代理协议、校验和错误处理，再使用自己的服务商账户测试真实调用。
