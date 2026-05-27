# Demo Script

对齐文档仓 [`docs/04-design#演示脚本`](../../../../docs/04-design.md#演示脚本) 与 [`06-plan#冲刺关键路径`](../../../../docs/06-plan.md#冲刺关键路径进度-ssot)。
更新时间：**2026-05-21**。

## A. 代码级 P0（rules，约 3 分钟）

1. 打开 Web 控制台，展示 PM 输入框和阶段列表。
2. 输入：「给文章列表加阅读量展示，前端假数据即可，不改后端。」
3. 触发 run（CLI 用 `npm run run:p0`；Web 需 `.env` 显式 `AI_MODE=rules` 后点击 Start run）。
4. 展示需求卡片：scope.exclude 含后端 schema/API。
5. 展示 plan、目标文件（`ArticlesPreview.jsx`、`styles.css`）。
6. 展示 diff（真实 Conduit 路径）与 verification（lint + Vitest）。
7. 展示 PR 草稿与 AI Usage（rules：`tokens=0` 为预期）。
8. History Context：`degraded` 时说明已跳过坏归档（H1–H2 已闭合）。

**证据 run**：`run-2026-05-21T02-16-15-215Z`

## B. §2.2 六项（课题完成视频，约 5–8 分钟）

| 顺序 | # | 演示内容 | 证据 run |
|------|---|----------|----------|
| 1 | #6 | 模糊输入「文章列表想好看一点，加点数据，别动太多代码」；`clarifications[]`；非零 tokens | `run-2026-05-21T05-58-01-181Z` |
| 2 | #4 | AI Usage 面板 non-zero badge | 同上 |
| 3 | #5 | 第二条相似 L1；plan `history_references` | `run-2026-05-21T05-51-56-519Z` |
| 4 | #3 | L2 草稿；`impact_matrix.cross_stack`；跨栈 diff | `run-2026-05-21T05-52-12-490Z` |
| 5 | #2 | `BLOCK_ON_CONFIRM=1` 下 waiting → Record review → Continue；plan 后改输入；**Resume from edit (plan kept)** | checkpoints + resume API |
| 6 | #1 | 第三 Skill 仅 `articleDetailWordCount.js` | `run-2026-05-21T05-52-18-277Z` |

详细时间轴见 [`video-recording-guide.md`](./video-recording-guide.md)。

## C. 提交与 PR（可选，约 1 分钟）

1. 展示 PR 草稿（`pr-draft.md`）；说明 H17 真实 draft PR / 上游 Conduit PR 是可选远端能力，当前 §8.2 提交不依赖它。
2. 展示 submission 材料索引（[`defense-prep.md`](./defense-prep.md)）。

## 不计入 #6 的说明（答辩备用）

早期 `run-2026-05-20T17-37-55-856Z` 等 doubao run：清晰 L1 输入，**不计入** §2.2 澄清深度。
