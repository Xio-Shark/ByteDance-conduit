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
cp .env.example .env   # 填入真实 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL
AI_MODE=llm PLAN_MODE=llm npm run dev
```

打开：

```text
http://localhost:5173
```

页面里可以直接点击示例需求，例如“阅读量展示”，系统会自动填入需求并发起运行。

> 答辩主路径默认走真实 LLM（`AI_MODE=llm PLAN_MODE=llm`）：澄清与计划阶段真实调用模型，留痕里的 tokens / 时延 / 成本均为真实非零值。`AI_MODE=rules` 仅作断网应急兜底，requirement/plan 由本地规则产出、tokens 全为 0，**不作为答辩演示链路**。

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
6. 展示多轮澄清、AI 用量、跨栈 schema-driven、历史方案复用、断点续跑和 Skill 注册证据。

## 关键证据

| 能力 | 证据目录 |
|---|---|
| L1 PM 到 PR 草稿 | `docs/reports/runs/run-2026-05-21T02-16-15-215Z` |
| 多轮 LLM 澄清 | `docs/reports/runs/run-l3-multi-turn-clarify` |
| plan 阶段 LLM 用量 | `docs/reports/runs/run-plan-llm-driven` |
| schema-driven 跨栈字段 | `docs/reports/runs/run-l2-auto-cover-image` |
| 历史方案复用（token 重叠召回） | `docs/reports/runs/run-semantic-recall-demo` |
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

生成下一步收口命令时默认只打印 `TODO` 和跳过提示，不复制最终 evidence JSON，也不执行验证；命令以非零退出提醒 blockers 仍未闭合。只有显式设置 `SUBMISSION_NEXT_STEPS_PREPARE_PLACEHOLDERS=1` 时才会通过 `scaffold:submission-evidence -- --kind <kind> --copy-final` 准备缺失的占位 evidence，只有显式设置 `SUBMISSION_NEXT_STEPS_RUN_VALIDATION=1` 时才会执行验证段。即使聚焦视图内的验证命令都执行成功，只要完整 gate 仍是 failed，生成脚本末尾仍会非零退出；如果过滤后没有任何 blocker 但完整 gate 仍 failed，保存后的 commands 脚本直接执行也会非零退出。

```bash
SUBMISSION_NEXT_STEPS_PREPARE_PLACEHOLDERS=1 npm run submission:next-steps -- --commands
SUBMISSION_NEXT_STEPS_RUN_VALIDATION=1 FRESH_CLONE_PATH=/path/to/fresh/clone npm run submission:next-steps -- --commands
npm run submission:next-steps -- --commands --write docs/reports/submission/next-steps.sh
npm run submission:next-steps -- --summary
npm run submission:next-steps -- --summary --write docs/reports/submission/next-steps-summary.json
npm run submission:next-steps:summary
npm run submission:next-steps:summary:write
npm run submission:next-steps:next:summary
npm run submission:next-steps:next:summary:write
npm run submission:next-steps:commands:write
npm run submission:next-steps:next:commands:write
```

使用 `--write` 或 package scripts 写文件，避免 `npm run ... > file` 把 npm banner 写入脚本。写出的 bash 脚本会自动设置执行权限。`scriptWriteRecommendation` 让自动化明确识别 commands 输出应通过 `--write`、`submission:next-steps:commands:write` 或 `submission:next-steps:next:commands:write` 保存；`summaryWriteRecommendation` 让自动化明确识别 summary 输出应通过 `--summary --write`、`submission:next-steps:summary:write` 或 `submission:next-steps:next:summary:write` 保存。

默认输出还会给出 `firstOpenClosureStep`、`fullGateFirstOpenClosureStep`、`fullGateSuggestedNextCommand`、`suggestedNextCommand`、`nextClosureCommandsWriteCommand`、`nextClosureSummaryWriteCommand`、`currentViewNextCommand`、`currentViewCommandsWriteCommand`、`currentViewSummaryWriteCommand`、`filterState`、`prerequisiteState`、`completionSemantics`、`nextStepFocus`、`actionSummary`、`nextClosureActionSummary`、`scriptWriteRecommendation` 和 `summaryWriteRecommendation`。`actionSummary` 汇总 evidence 文件数、人工输入数、验证命令数、可 scaffold 的 blocker、需要 fresh clone 路径的 blocker，以及缺少准备动作或验证命令的 blocker。`nextClosureActionSummary` 用同一口径汇总当前视图最早未闭合收口组。

Markdown 输出也会显示当前视图的安全写入命令，并以 `Action summary` 行显示 evidence 文件数、人工输入数、验证命令数、可 scaffold blocker、fresh clone blocker、缺少准备动作的 blocker 和缺少验证命令的 blocker；`Next closure action summary` 用同一格式只显示当前视图最早未闭合收口组；commands 输出也会在脚本头部写入同等 `# action_*` 和 `# next_action_*` 注释。`currentViewCommandsWriteCommand` 保留当前 `--next` / `--category` / `--plan-item` / `--blocker` 过滤器，并追加 `--commands --write docs/reports/submission/next-steps.sh`。`nextClosureSummaryWriteCommand` 则把下一收口组聚焦 summary 直接保存为 `docs/reports/submission/next-steps-summary.json`。`currentViewSummaryWriteCommand` 保留当前过滤器与转发参数，并追加 `--summary --write docs/reports/submission/next-steps-summary.json`。Markdown 输出也会显示当前视图的安全写入命令。

`--public-repo` 和 `--u6-manifest` 会保留到 `forwardedGateArgs[]`、下一步建议命令、下一收口组写入命令和当前视图写入命令里。当 commands 输出需要 fresh clone 路径且已传入 `--public-repo` 时，生成脚本会把该路径作为 `FRESH_CLONE_PATH` 默认值。默认 JSON 输出包含 `actionWarnings[]`；`--summary` 仅在存在缺少准备动作或缺少验证命令的 blocker 时保留该字段。Markdown 会显示 `Action warnings` 行，commands 头部会写入 `# action_warnings=...` 注释。该字段只做交接诊断，不改变完整 gate 完成判定、过滤视图语义或退出码。

Closure progress 字段补充：`closureProgressSummary` 按本地 evidence、公开仓 fresh clone、外部提交 evidence、pre-submission gate 四段收口顺序汇总完整 gate 和当前视图的未闭合 blocker。Markdown 会显示 `Closure progress summary` 行和 `Closure Progress Summary` 小节，commands 头部会写入 `# closure_progress=...` 注释。过滤视图会标明过滤视图隐藏了多少完整 gate blocker，明确只有完整 gate 通过且 blocker 为 0 时才能标记提交完成，并标明过滤视图是否正在使用 `categoryNextSteps` 覆盖普通 `nextStep`。

`fullGateSuggestedNextCommand` 始终指向未过滤完整 gate 的最早收口组，`suggestedNextCommand` 则保留当前过滤器，用于继续查看当前聚焦视图。`nextClosureCommandsWriteCommand` 则把下一收口组聚焦视图直接保存为 `docs/reports/submission/next-steps.sh`。`currentViewNextCommand` 在已聚焦视图中优先指向当前 Markdown / JSON / commands 视图的可复制命令。`prerequisiteState` 会在聚焦视图从较晚收口组开始时列出被跳过的完整 gate 前置步骤。JSON 输出保留原始 `nextSteps[]` 方便审计完整 gate，同时提供 `focusedNextSteps[]` 表示当前过滤范围内实际用于 `actionPlan[]` 的 next step。

`--summary` 输出紧凑 JSON，保留完整 blocker 数、过滤后 blocker 数、隐藏 blocker 数、完整 gate 建议命令、当前视图建议命令、当前视图 summary 写入命令、`actionSummary` / `nextClosureActionSummary` 聚合计数、当前 blocker 和验证入口。`filterState.emptyBecauseOfFilters` 会明确空结果是过滤视图造成的。带 `--category` 时，`blockers[].nextStep`、`focusedNextSteps[]`、`actionPlan[]`、`evidenceChecklist`、`closureSequence`、`planItemBlockers` 与 `categoryBlockers[]` 会优先使用对应 `categoryNextSteps`。当失败 check 带 `evidence[]` 时，Markdown / commands 输出会显示最多 5 条截断 evidence 摘要和剩余数量。`blockerCount`、`completionSemantics.fullGateStatus`、`prerequisiteState.fullGateFirstOpenClosureStep`、`fullGateSuggestedNextCommand` 和退出码始终反映完整 gate 状态。`completionSemantics.filtersChangeCompletion=false` 明确过滤器只改变视图，不改变完成判定。当聚焦视图跳过完整 gate 前置步骤时，commands 脚本执行时也会打印 warning、完整 gate next-step 命令和被跳过的 prerequisite 列表。

## LLM 与 GitHub 配置

复制 `.env.example` 到 `.env`，只在本地填写真实密钥：

```bash
cp .env.example .env
```

常用变量：

```text
AI_MODE=llm
PLAN_MODE=llm
SANDBOX_REPO_PATH=./sandbox-repo
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
```

说明：

- `AI_MODE=llm` / `PLAN_MODE=llm`：**答辩主路径**。澄清与计划阶段真实调用 LLM，留痕 tokens / 时延 / 成本为真实非零值。
- `AI_MODE=rules` / `PLAN_MODE=rules`：断网应急兜底，由本地规则产出 requirement/plan，tokens 全为 0，不作为演示链路。
- `GITHUB_TOKEN`：仅在需要真实创建 GitHub draft PR 时使用；普通演示只需要本地 `pr-draft.md`。

第三方模型声明：本系统通过 OpenAI 兼容接口调用 DeepSeek（`deepseek-v4-flash`，`https://api.deepseek.com`）完成需求澄清与计划阶段。模型可经 `LLM_*` 环境变量替换为豆包 EP 或其他 OpenAI 兼容服务，密钥只在本地 `.env` 配置，不写入仓库或提交材料。

## 目录概览

```text
apps/web/                 React + Vite 控制台
apps/api/                 Node API
services/orchestrator/    交付状态机、事件、证据归档
services/agents/          Requirement / Plan / Verify / PR
services/skills/          需求模式 Skill 注册表
services/codegen/         schema-driven 跨栈生成
services/index/           sandbox 索引与历史方案复用（token 重叠召回）
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
