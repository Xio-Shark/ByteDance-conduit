# Conduit Super Individual

面向 Conduit 的端到端 AI 交付系统。PM 输入自然语言需求后，系统完成需求澄清、方案拆解、真实 `sandbox-repo` 代码写入、Lint / 单测验证，并生成可审阅的 PR 草稿。

本仓是 AI 系统主仓，内含 Conduit 真实代码目录 `sandbox-repo/`。它不是向上游 Conduit 直接提 PR 的仓库。

## 你可以看到什么

- Web 控制台：PM 需求输入、示例需求、阶段进度、结果面板。
- Node API：运行创建、归档读取、diff、PR 草稿、断点续跑。
- Orchestrator / Agent / Skill：澄清、计划、编码、验证、PR 草稿编排。
- Conduit 实仓改动：所有核心 diff 来自 `sandbox-repo/`。
- 证据留痕：每次运行写入 `docs/reports/runs/<run-id>/`。

## 快速启动

```bash
npm install
npm install --prefix sandbox-repo
AI_MODE=rules PLAN_MODE=rules npm run dev
```

打开：

```text
http://localhost:5173
```

页面里可以直接点击示例需求，例如“阅读量展示”，系统会自动填入需求并发起运行。

## 录屏演示路线

建议按这份文档录制：

```text
docs/reports/submission/demo-flow-narration.md
```

推荐展示顺序：

1. Web 控制台输入或点击示例 PM 需求。
2. 展示需求卡片和方案。
3. 展示真实 Conduit diff。
4. 展示 Lint / 单测验证结果。
5. 展示 PR 草稿。
6. 展示多轮澄清、AI 用量、跨栈 schema-driven、语义召回、断点续跑和 Skill 注册证据。

## 关键证据

| 能力 | 证据目录 |
|---|---|
| L1 PM 到 PR 草稿 | `docs/reports/runs/run-2026-05-21T02-16-15-215Z` |
| 多轮 LLM 澄清 | `docs/reports/runs/run-l3-multi-turn-clarify` |
| plan 阶段 LLM 用量 | `docs/reports/runs/run-plan-llm-driven` |
| schema-driven 跨栈字段 | `docs/reports/runs/run-l2-auto-cover-image` |
| 语义历史召回 | `docs/reports/runs/run-semantic-recall-demo` |
| 非文章列表 Skill | `docs/reports/runs/run-l2-comment-like` |
| 提交与答辩材料 | `docs/reports/submission/` |

## 常用命令

```bash
npm run dev                 # API + Web
npm run run:p0              # 稳定 L1 rules 链路
npm run test                # 单测
npm run lint:sandbox        # Conduit 目标文件 lint
npm run test --prefix sandbox-repo
npm run build -w apps/web
npm run archive:dry-run
```

完整本地代码门禁：

```bash
npm run verify
```

公开视频 / 外部提交收口：

```bash
npm run check:video-evidence
npm run check:external-submission
npm run check:public-repo -- --repo <fresh-clone-path>
npm run check:submission-gates -- --public-repo <fresh-clone-path>
```

## LLM 与 GitHub 配置

复制 `.env.example` 到 `.env`，只在本地填写真实密钥：

```bash
cp .env.example .env
```

常用变量：

```text
AI_MODE=rules
PLAN_MODE=rules
SANDBOX_REPO_PATH=./sandbox-repo
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
```

说明：

- `AI_MODE=rules` / `PLAN_MODE=rules`：稳定演示用，不需要模型密钥。
- `AI_MODE=llm`：真实 LLM 澄清，用于展示多轮澄清能力。
- `PLAN_MODE=llm`：plan 阶段真实 LLM，用于展示非零 tokens 和可观测性。
- `GITHUB_TOKEN`：仅在需要真实创建 GitHub draft PR 时使用；普通演示只需要本地 `pr-draft.md`。

## 目录概览

```text
apps/web/                 React + Vite 控制台
apps/api/                 Node API
services/orchestrator/    交付状态机、事件、证据归档
services/agents/          Requirement / Plan / Verify / PR
services/skills/          需求模式 Skill 注册表
services/codegen/         schema-driven 跨栈生成
services/index/           sandbox 索引与语义召回
sandbox-repo/             Conduit 真实代码目录
docs/reports/runs/        运行证据
docs/reports/submission/  演示、答辩、提交材料
```

## 安全边界

- 不提交 `.env`、真实 API key、Bearer token 或 GitHub token。
- `.env.example` 只保留占位字段。
- 团队成员信息不进入公开仓，通过比赛提交系统单独填写。
- 当前最小交付证明使用本地 `pr-draft.md`，真实远端 draft PR 是可选能力。

## 当前状态

代码和本地 run 证据已覆盖 MVP 与 §2.2 亮点。最终比赛提交仍需要人工补齐 Demo URL、3-8 分钟演示视频 URL、`video-evidence.json`、`external-submission-evidence.json` 和最终 submission gate。
