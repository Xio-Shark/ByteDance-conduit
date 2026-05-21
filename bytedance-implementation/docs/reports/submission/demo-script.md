# Demo Script

对齐文档仓 [`docs/04-design#演示脚本`](../../../../docs/04-design.md#演示脚本) 与 [`06-plan#冲刺关键路径`](../../../../docs/06-plan.md#冲刺关键路径进度-ssot)。

## A. 代码级 P0（rules，约 3 分钟）

1. 打开 Web 控制台，展示 PM 输入框和阶段列表。
2. 输入：「给文章列表加阅读量展示，前端假数据即可，不改后端。」
3. 触发 run（`AI_MODE=rules` 或 Web Run P0）。
4. 展示需求卡片：scope.exclude 含后端 schema/API。
5. 展示 plan、目标文件（`ArticlesPreview.jsx`、`styles.css`）。
6. 展示 diff（真实 Conduit 路径）与 verification（lint + Vitest）。
7. 展示 PR 草稿与 AI Usage（rules：`tokens=0` 为预期）。
8. 说明 History Context：若 `invalid_history`，须先完成 H1–H2 再演示 #5。

## B. §2.2 六项（课题完成视频，约 5–8 分钟）

| 顺序 | # | 演示内容 | 任务 |
|------|---|----------|------|
| 1 | #6 | 输入 **故意模糊** 需求（如「文章列表想好看一点，加点数据」）；展示 LLM 多轮追问；`requirement.md` 含 `clarifications[]`；`ai-calls.jsonl` 非零 tokens | H4 |
| 2 | #4 | AI Usage 面板汇总非零 metrics（与 #6 同 run 或专用 run） | H13 |
| 3 | #5 | 第二条 **相似** 需求；plan 中可见 history-recall 引用段落 | H8–H9 |
| 4 | #3 | L2 跨栈 run（封面图或草稿）；plan 影响矩阵；diff 含 frontend + backend | H10–H11 |
| 5 | #2 | plan 确认后 **修改输入**；`resume-from-stage` 只重跑 edit→verify→pr；上游 `plan.md` 保留 | H5–H7 |
| 6 | #1 | 现场或录屏：仅 **新增 1 个 Skill 文件** 接入第 3 模式；git diff 证明 orchestrator 主干未改 | H12 |

## C. 提交与 PR（可选，约 1 分钟）

1. 展示 Submit PR：须 `confirm=true`、`head`、`base` 及 GitHub 配置。
2. 若有 H17 draft PR URL，展示归档证据。
3. 展示 submission 页：Demo/视频/公开仓链接（S6–S8）。

## 不计入 #6 的说明（答辩备用）

早期 `run-2026-05-20T17-37-55-856Z` 等探索 run 虽有非零 tokens，但输入为 **清晰 L1 原句**，仅作工程探索，**不作为 §2.2 澄清深度证据**。
