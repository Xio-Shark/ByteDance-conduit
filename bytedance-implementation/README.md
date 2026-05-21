# Conduit Super Individual

面向 Conduit 仓库的端到端 AI 交付系统。目标是让 PM 输入一条 L1 需求后，系统完成澄清、方案、真实 Conduit 写入、验证和 PR 草稿。

模型策略见文档仓 [`docs/01-understanding.md`](../docs/01-understanding.md#完成定义分层)：

- **代码级 P0（当前）**：`AI_MODE=rules`（`rules-first-p0`），`npm run run:p0` / `npm run verify` 可验证胶水链路。
- **课题完成（进行中）**：`AI_MODE=llm` 已接入 `clarifyWithLlm`；须 **模糊输入** 验收 run + §2.2 六项证据；见文档仓 [`06-plan#冲刺关键路径`](../docs/06-plan.md#冲刺关键路径进度-ssot) 与 `docs/reports/submission/ai-usage.md`。

## 当前 P0 主线

需求：给文章列表加阅读量展示，前端假数据即可，不改后端。

流程：

1. `apps/web` 提供对话与流程控制台。
2. `apps/api` 提供 Node API。
3. `services/orchestrator` 串联 Requirement / Planning / Coding / Verification / PR Agent。
4. `services/skills` 注册 `article-list-display-field` Skill。
5. `services/sandbox` 写入真实 `sandbox-repo` 并生成 git diff。
6. `docs/reports/runs/<run-id>` 保存需求、历史召回、方案、diff、验证和 PR 草稿。

## 目录结构

```text
apps/
├── web/                 # React + Vite 控制台
└── api/                 # Express API
services/
├── orchestrator/        # 阶段状态机与证据归档
├── agents/              # 澄清、规划、编码、验证、PR Agent
├── skills/              # Skill 注册与 L1 Skill
└── sandbox/             # Conduit 仓库适配器
libs/types/              # 共享阶段常量
external/git-provider/   # GitHub PR 创建适配器
docs/reports/            # 运行证据与提交材料
sandbox-repo/            # Conduit fork/clone（§8.2 须随 AI 主仓一并公开）
```

## 配置

复制 `.env.example` 到 `.env` 并按需填写 GitHub 与 sandbox 路径。不要把真实密钥提交到仓库。

```bash
AI_MODE=rules
SANDBOX_REPO_PATH=./sandbox-repo
# 答辩路径 LLM（AI_MODE=llm 时使用，勿提交真实 key）：
# LLM_API_KEY=
# LLM_MODEL=
# LLM_BASE_URL=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_API_BASE_URL=https://api.github.com
API_PORT=3001
```

支持 `AI_MODE=rules`（默认胶水）与 `AI_MODE=llm`（真实 LLM 澄清，须配置 `LLM_*`）。见 `docs/reports/submission/ai-usage.md`。

## 安装

```bash
npm install
cd sandbox-repo
npm install
```

## 运行

```bash
npm run dev
```

默认地址：

- Web: `http://localhost:5173`
- API: `http://localhost:3001`

需要避开本机已有服务时可显式指定端口和 API 代理：

```bash
API_PORT=3101 npm run dev:api
WEB_PORT=5179 WEB_STRICT_PORT=true API_TARGET=http://localhost:3101 npm run dev:web
```

P0 CLI（读取 `.env` 中的 `AI_MODE`）：

```bash
npm run run:p0          # 跟随 .env（llm 或 rules）
npm run run:p0:rules    # 强制规则模式
npm run run:p0:llm      # 强制 LLM 模式
```

`ai-calls.jsonl` 会标记 `rules-first-p0`；确定性 plan / edit / verify / PR draft 阶段分别由 `plan.md`、`diff.patch`、`verification.json` 和 `pr-draft.md` 表达。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/skills` | Skill 列表 |
| `GET` | `/api/history` | 从归档 evidence 召回相似历史需求 |
| `POST` | `/api/runs` | 创建并执行 P0 DeliveryRun |
| `GET` | `/api/runs/:id` | 查询内存或归档证据中的 run |
| `GET` | `/api/runs/:id/events` | SSE 输出阶段事件 |
| `GET` | `/api/runs/:id/diff` | 查看 git diff |
| `GET` | `/api/runs/:id/pr-draft` | 查看 PR 草稿 |
| `POST` | `/api/runs/:id/pr` | 显式确认后通过 GitHub API 创建 draft PR |
| `GET` | `/api/runs/:id/submission` | 查看提交材料摘要 |
| `POST` | `/api/runs/:id/retry` | 基于修订输入 **创建新 run**（`retryOf`）；非阶段级断点重放 |
| `POST` | `/api/runs/:id/confirm` | 记录人工确认到内存和 `metadata.json` |

`GET`、`retry` 和 `confirm` 会先查内存 run；如果 API 重启导致内存为空，会从 `docs/reports/runs/<run-id>` 的归档证据恢复。归档恢复依赖已生成的 evidence 文件，不会伪造缺失阶段。

Web 控制台会展示 `ai-calls.jsonl` 派生的 AI Usage 面板，包括规则调用次数、tokens、延迟、成本和调用状态。

真实创建 PR 必须提供 `GITHUB_TOKEN`、`GITHUB_OWNER` 和 `GITHUB_REPO`，并在请求中显式传入 `confirm=true`、`head` 和 `base`。

## 验证

```bash
npm run test
npm run verify
```

P0 运行会读取 Conduit 根 `package.json` 的真实 scripts。当前 Conduit 根仓有 `test: vitest`，没有 `lint`；系统会改用实现仓库的 `npm run lint:sandbox` 对本次改动的 Conduit 文件运行真实 ESLint 检查，并真实运行 Conduit `npm test`。

`npm run verify` 会串联实现仓库 Node 测试、sandbox lint、Conduit sandbox 单测和 Web 构建。

## AI 使用边界

- **代码级 P0**：澄清 `rules-first-p0`（`services/agents/src/requirementAgent.js` + Skill 注册表）。
- **提交 / 答辩**：须另备真实 LLM clarify；说明见 `docs/reports/submission/ai-usage.md`。
- 规划 / 编码 / 验证 / PR：确定性 Agent + Skill，不以 mock 替代 Conduit 写入或验证。
- 禁止把真实 API key、EP 或 Bearer token 写入 README、源码、测试快照、运行报告或 PR 描述。

## 完成判定

### 代码级 P0（`npm run run:p0`）

- `sandbox-repo` 来源为 `TonyMckes/conduit-realworld-example-app`。
- `sandbox-repo/frontend/src/components/ArticlesPreview/ArticlesPreview.jsx` 产生真实 diff。
- `sandbox-repo/frontend/src/styles.css` 产生真实 diff。
- `docs/reports/runs/<run-id>/requirement.md`
- `docs/reports/runs/<run-id>/history-recall.json`
- `docs/reports/runs/<run-id>/plan.md`
- `docs/reports/runs/<run-id>/diff.patch`
- `docs/reports/runs/<run-id>/verification.json`
- `docs/reports/runs/<run-id>/pr-draft.md`
- `docs/reports/runs/<run-id>/ai-calls.jsonl`（含 `rules-first-p0`）

### 课题完成（§2.1 + §2.2 六项 + §8.2）

- [ ] §2.2 六项 — 见文档仓 [`docs/06-plan.md`](../../docs/06-plan.md#22-六项追踪)
- [ ] 公开本仓 + `sandbox-repo/`、Demo、3–8 分钟视频、团队信息
