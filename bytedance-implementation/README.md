# Conduit Super Individual

面向 Conduit 仓库的端到端 AI 交付系统。目标是让 PM 输入一条 L1 需求后，系统完成澄清、方案、真实 Conduit 写入、验证和 PR 草稿。

模型策略见文档仓 [`docs/01-understanding.md`](../docs/01-understanding.md#完成定义分层) 与 [`仓库导航.md`](../仓库导航.md)（实现仓目录与证据说明）：

- **代码级 P0（当前）**：显式 `AI_MODE=rules`（`rules-first-p0`），`npm run run:p0` / `npm run verify` 可验证胶水链路。
- **课题完成未闭合（仅代码/run 证据已齐）**：§2.2 六项 run 已归档，但不得声称课题完成；必须等 §8.2 视频、公开 AI 主仓、Demo URL 和团队信息人工补齐。公开目标是本实现仓，且仓内包含 `sandbox-repo/`；不是直接向上游 Conduit 仓库提交 PR。

## 端到端流程（5–8 句）

1. PM 在 Web 控制台输入自然语言需求，API 创建 DeliveryRun 并进入 clarify → plan → edit → verify → pr 阶段链。
2. Requirement Agent 产出结构化 `requirement.md`（含多轮 `clarifications[]`）；Planning Agent 结合 `history-recall` 写入 `plan.md` 与 Skill 定位。
3. Coding Agent 通过 Skill 注册表匹配能力（如 L1 阅读量、L2 草稿、Popular Tags 前 5 打标），在 `sandbox-repo` 生成真实 git diff。
4. Verification Agent 执行 Conduit Vitest 与 `lint:sandbox`；PR Agent 生成 `pr-draft.md`；全程事件与 checkpoint 写入 `docs/reports/runs/<run-id>/`。
5. 支持 `POST /api/runs/:id/resume-from-stage` 断点重放；`retry` 创建新 run 并保留 `retryOf` 溯源。
6. `ai-calls.jsonl` 记录每次模型调用；Web 展示单 run AI Usage 与 `GET /api/ai-usage/summary` 跨 run 成功归档汇总。
7. 本地验证：`npm run run:p0`（显式 rules 固定 L1）或 `npm run run:fuzzy-llm`；质量门禁：`npm run verify`。
8. 发布候选包检查：`npm run archive:dry-run` 枚举实现源码、submission、`sandbox-repo/` 与关键 run 证据，输出路径清单 hash 和内容 hash；它不替代公开仓 URL、Demo、视频或团队信息。
9. 架构图见 [`docs/reports/submission/architecture.md`](./docs/reports/submission/architecture.md)；§2.2 证据索引见 [`docs/06-plan.md#22-六项追踪`](../docs/06-plan.md#22-六项追踪)。

## 当前 P0 主线

需求：给文章列表加阅读量展示，前端假数据即可，不改后端。

组件分工：

1. `apps/web` — 对话与流程控制台、澄清多轮展示、跨 run AI Usage 汇总；`App.jsx` 只装配控制台，`useConsoleController.js` 承载 Web 状态与 action 胶水。
2. `apps/api` — Express API、归档恢复、断点重放、GitHub PR 适配；`runRoutes.js` 只聚合 execution/evidence/review 三类 run 路由。
3. `services/orchestrator` — 阶段状态机、证据归档、历史召回。
4. `services/agents` — Requirement / Planning / Coding / Verification / PR Agent。
5. `services/skills` — **4+ Skill**（L1 阅读量、L2 草稿、详情字数、Popular Tags 前 5；答辩可只加 1 个新 Skill 文件）。
6. `services/sandbox` — 写入真实 `sandbox-repo` 并生成 git diff。
7. `docs/reports/runs/<run-id>` — 需求、历史召回、方案、diff、验证和 PR 草稿。

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
scripts/                 # E2E、archive dry-run、pre-submission 检查
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

支持 `AI_MODE=rules`（本地胶水）与 `AI_MODE=llm`（真实 LLM 澄清，须配置 `LLM_*`）。运行路径必须显式带 `AI_MODE`；`.env.example` 仅给本地 Web/API 开发提供 rules 示例。见 `docs/reports/submission/ai-usage.md`。

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

P0 CLI（脚本显式声明 mode 和输入；直接调用 `cli.js` 时也必须传入非空需求）：

```bash
npm run run:p0          # 等同 run:p0:rules，固定 L1 rules demo
npm run run:p0:rules    # 显式规则模式
npm run run:fuzzy-llm   # 模糊输入 LLM 澄清演示
```

`ai-calls.jsonl` 会标记 `rules-first-p0`；确定性 plan / edit / verify / PR draft 阶段分别由 `plan.md`、`diff.patch`、`verification.json` 和 `pr-draft.md` 表达。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/skills` | Skill 列表 |
| `GET` | `/api/history` | 从归档 evidence 召回相似历史需求 |
| `GET` | `/api/ai-usage/summary` | 跨 passed run 汇总 AI usage；`run-summary.json.aiUsage` 必须与 `ai-calls.jsonl` 一致，失败/不完整归档列入 `skipped` |
| `POST` | `/api/runs` | 创建并执行 P0 DeliveryRun |
| `GET` | `/api/runs/:id` | 查询内存或归档证据中的 run |
| `GET` | `/api/runs/:id/events` | SSE 输出阶段事件 |
| `GET` | `/api/runs/:id/diff` | 查看 git diff |
| `GET` | `/api/runs/:id/pr-draft` | 查看 PR 草稿 |
| `POST` | `/api/runs/:id/pr` | 显式确认后通过 GitHub API 创建 draft PR |
| `GET` | `/api/runs/:id/submission` | 查看提交材料摘要 |
| `POST` | `/api/runs/:id/resume-from-stage` | 从指定阶段重放下游（§2.2 断点重放） |
| `POST` | `/api/runs/:id/retry` | 基于修订输入 **创建新 run**（`retryOf`）；非阶段级断点重放 |
| `POST` | `/api/runs/:id/confirm` | 记录人工确认到内存和 `metadata.json` |

`GET`、`retry` 和 `confirm` 会先查内存 run；如果 API 重启导致内存为空，会从 `docs/reports/runs/<run-id>` 的归档证据恢复。归档恢复依赖已生成的 evidence 文件，不会伪造缺失阶段。

Web 控制台会展示持久化 `aiUsage` 与 `ai-calls.jsonl` 校验后的 AI Usage 面板，包括规则调用次数、tokens、延迟、成本和调用状态。跨 run 面板只聚合 `run-summary.json` 标记为 `passed` 且 `aiUsage` 与调用日志一致的归档，失败或不完整归档会以 `skipped` 明示。

真实创建 PR 必须提供 `GITHUB_TOKEN`、`GITHUB_OWNER` 和 `GITHUB_REPO`，并在请求中显式传入 `confirm=true`、`head` 和 `base`。该能力属于 H17 可选远端补强；代码级 P0 只要求生成 `pr-draft.md`。若目标是上游 Conduit，通常需要先 fork 到有权限的账号，再从 fork 分支发起 PR。

## 验证

```bash
npm run test
npm run verify
npm run archive:dry-run
```

P0 运行会读取 Conduit 根 `package.json` 的真实 scripts。当前 Conduit 根仓有 `test: vitest`，没有 `lint`；只有 Skill `validation` 显式声明 `npm run lint:sandbox` 时，系统才使用实现仓 adapter 对本次改动的 Conduit 文件运行真实 ESLint 检查，否则记录 gap/fail；Conduit `npm test` 始终来自真实 sandbox script。

`npm run verify` 会串联实现仓库 Node 测试、sandbox lint、Conduit sandbox 单测和 Web 构建。

`npm run archive:dry-run` 读取 `scripts/archive-manifest.json`，检查候选发布包的必需路径与关键 run 证据，排除 `.env`、`node_modules`、构建产物和测试结果目录，并输出 `manifestHash` / `contentHash` 便于发布日前后对比候选包是否变化。它只证明本地候选包可枚举，不替代 §8.2 的公开 AI 系统主仓、Demo URL、演示视频和团队信息。

发布日前最终门禁：

```bash
bash scripts/pre-submission-check.sh
```

该脚本会先运行 archive dry-run，再检查 manifest required 路径是否被 Git 跟踪、关键发布路径是否仍未跟踪、submission 是否仍有人工占位和最终提交项是否完成；只有这些 readiness 检查都通过后才继续执行 `npm run verify`。

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

- [x] §2.2 六项 — 证据见 `docs/reports/runs/` 与 [`docs/06-plan.md`](../docs/06-plan.md#22-六项追踪)
- [ ] §8.2 对外链接 — 见 `docs/reports/submission/team-info.md`、`public-repo-guide.md`（视频/公开 AI 主仓/团队名待人工）
