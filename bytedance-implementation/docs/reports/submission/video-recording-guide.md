# 演示视频录制指南（S7）

§8.2 要求：**3–8 分钟**，覆盖 **§2.1 MVP** + **§2.2 六项** + **§7.2 留痕**。本文档为录制脚本与检查清单；**视频文件/外链仍须人工录制后填入** [`team-info.md`](./team-info.md)。

---

## 录制前准备

```bash
cd bytedance-implementation
cp .env.example .env   # 配置 LLM_*（勿入库）
npm install && cd sandbox-repo && npm install && cd ..
npm run verify         # 108 项 Node/API/Web/scripts 测试；107 pass / 1 skip
BLOCK_ON_CONFIRM=1 npm run dev  # Web :5173 / API :3001；用于录制真实暂停/确认/继续
```

| 检查项 | 证据 |
|--------|------|
| 模糊 LLM run 已归档 | `run-2026-05-21T05-58-01-181Z` |
| L2 跨栈 run | `run-2026-05-21T05-52-12-490Z` |
| 历史召回入 plan | `run-2026-05-21T05-51-56-519Z` |
| 第三 Skill | `run-2026-05-21T05-52-18-277Z` |
| 人工确认 | `BLOCK_ON_CONFIRM=1` 后进入 waiting 阶段，再 Record review + Continue |
| 断点重放 | Web「Resume from edit (plan kept)」 |
| AI 留痕材料 | `prompt-changelog.md`、`clarify-conversation-export.md` |

---

## 建议时间分配（总计 6–7 分钟）

| 时段 | 内容 | §2.2 / §7.2 |
|------|------|-------------|
| 0:00–0:30 | 开场：项目目标、三层架构图（可开 `architecture.md`） | — |
| 0:30–1:30 | **#6 澄清深度**：输入模糊句「文章列表想好看一点，加点数据，别动太多代码」；展示 `requirement.md` 的 `clarifications[]` | #6 / §7.2-1 |
| 1:30–2:00 | **#4 可观测性**：同 run 打开 AI Usage 面板，non-zero badge、tokens/延迟/成本 | #4 |
| 2:00–2:45 | **#5 业务上下文**：第二条相似 L1 需求；plan 中 `history_references` | #5 |
| 2:45–3:30 | **#3 跨栈**：L2 草稿需求；plan `impact_matrix.cross_stack`；diff 含 frontend+backend | #3 |
| 3:30–4:30 | **#2 断点重放 / 人工 gate**：用 `BLOCK_ON_CONFIRM=1` 展示 waiting → Record review → Continue；再演示 plan 后改输入 → resume-from-stage → 仅 edit→verify→pr | #2 |
| 4:30–5:15 | **#1 抽象到位**：说明 4 Skill；展示第 3/4 个仅新增 Skill 文件 | #1 |
| 5:15–6:00 | L1 rules 快速闭环 + diff + verification + PR 草稿 | §2.1 MVP |
| 6:00–6:30 | §7.2 留痕：`prompt-changelog`、模型清单（`ai-usage.md`） | §7.2 |
| 6:30–7:00 | 收尾：亮点三条 + 公开 AI 主仓/Demo 链接（若已就绪） | §8.2 |

详细逐步脚本见 [`demo-script.md`](./demo-script.md)。

---

## 必拍镜头清单

- [ ] PM 输入框 + 阶段进度条
- [ ] 模糊输入 → LLM clarify 产物（3 条 clarifications）
- [ ] AI Usage 面板 **非零** metrics
- [ ] plan.md 中 history_references 段落
- [ ] L2 plan 影响矩阵 + 跨栈 diff
- [ ] resume-from-stage 按钮与重放后 events
- [ ] 4 个 Skill 文件列表 / registry
- [ ] verification.json 通过 + pr-draft.md
- [ ] submission 目录或 `prompt-changelog.md` 一页

---

## 口播备用：不计入 #6 的说明

早期 `run-2026-05-20T17-37-55-856Z` 等 doubao 探索 run 虽有非零 tokens，但输入为 **清晰 L1 原句**，仅作工程探索，**不作为 §2.2 澄清深度证据**。验收口径 run 为 `run-2026-05-21T05-58-01-181Z`（模糊输入 + `mimo-v2.5`）。

---

## 录制完成后

1. 将视频上传至可公开访问的平台。
2. 在 [`team-info.md`](./team-info.md) 填写「演示视频链接」。
3. 在 [`checklist.md`](./checklist.md) 勾选 S7。
