# Prompt / Skill Changelog

对齐文档仓 [`docs/05-dev.md#ai-使用留痕`](../../../../docs/05-dev.md#ai-使用留痕) 与 §7.2-1（Prompt / Skill 版本与变更意图）。

**时间线来源**：实现仓 run 归档目录 `docs/reports/runs/`（35 个 run，2026-05-20 17:09 UTC 至 2026-05-21 05:58 UTC）。本地仓库截至 2026-05-21 尚无 git commit，故不引用 commit hash，以 run ID 与源码路径为证据。

---

## 迭代策略摘要

1. **clarify 双路径**：`AI_MODE=rules` 用规则工厂（`rules-first-p0`）；`AI_MODE=llm` 用 `clarifyWithLlm` + 远端模型（验收 run 使用 `mimo-v2.5`）。
2. **plan / edit / verify / pr** 走确定性 Agent + Skill，**不写入** `ai-calls.jsonl`（事实源为 `plan.md`、`diff.patch`、`verification.json`、`pr-draft.md`）。
3. **新增需求模式优先新增 Skill 文件**，注册到 `services/skills/src/registry.js`，不改 Orchestrator / Agent 主干（§2.2 #1）。
4. **模糊输入**须产出 `clarifications[]` 开放问题；清晰 L1 原句的 legacy 探索 run **不计入** §2.2 #6 验收口径。

---

## Prompt 变更记录

### 1. `rules-first-p0`（规则澄清，非 LLM Prompt）

| 字段 | 内容 |
|------|------|
| 标识 | `rules-first-p0` |
| 版本 | 隐式 `1.0.0`（无独立 Prompt 文件） |
| 源码 | `services/agents/src/requirementAgent.js` |
| 引入时间 | 2026-05-20（首批 rules run 归档） |
| 变更意图 | 代码级 P0 胶水：按关键词路由 L1 阅读量 / L2 草稿 / 详情字数，输出结构化需求卡片；tokens/延迟/成本恒为 0 |
| 关键规则 | 阅读量 → L1 且 exclude 后端；草稿 → L2 跨栈；字数 → L1 详情页 |
| 验收证据 | `run-2026-05-21T02-16-15-215Z`（代码级 P0 L1 闭环） |

### 2. `clarify-llm-system` · `1.0.0-llm`

| 字段 | 内容 |
|------|------|
| 常量 | `CLARIFY_PROMPT_VERSION = "1.0.0-llm"` |
| 源码 | `services/agents/src/clarifyWithLlm.js` |
| 引入时间 | 2026-05-21（H3/H4 模糊 LLM 验收前接入） |
| 变更意图 | §2.2 #6 澄清深度：模糊/缺边界输入必须主动追问，禁止静默决策；L1 列表展示任务不得擅自扩后端 |
| 关键规则摘要 | 仅返回 JSON 需求卡片；`clarifications` 须为 PM 可回答的开放问题；L1 阅读量假数据场景 exclude 后端 schema |
| 配套校验 | `services/agents/src/requirementCard.js` 缺字段直接失败 |
| 验收证据 | `run-2026-05-21T05-58-01-181Z`（`mimo-v2.5`，248/1818 tokens，3 条 `clarifications[]`） |
| 备注 | 归档 `ai-calls.jsonl` 中 `prompt_version` 字段可能显示 `1.0.0`（pipeline 回退到 skill_version）；源码 SSOT 为 `1.0.0-llm` |

### 3. Legacy 探索：`doubao-seed-2-0-lite-260428`（不计入 §2.2 #6）

| 字段 | 内容 |
|------|------|
| 模型 | `doubao-seed-2-0-lite-260428` |
| 时间 | 2026-05-20 17:26–17:37 UTC |
| 变更意图 | 早期 LLM 网关连通性探索；输入为**清晰 L1 原句**（非模糊验收口径） |
| 证据 | `run-2026-05-20T17-37-55-856Z`、`run-2026-05-20T17-26-03-046Z` |
| 状态 | **legacy**；当前产品路径已切换为 `AI_MODE=llm` + `mimo-v2.5` |

---

## Skill 变更记录

| Skill ID | 版本 | 等级 | 引入 / 证据 run | 变更意图 | 匹配关键词 | 目标路径 | 改主干？ |
|----------|------|------|-----------------|----------|------------|----------|----------|
| `article-list-display-field` | 1.0.0 | L1 | 2026-05-20；`run-2026-05-21T02-16-15-215Z` | P0 主线：文章列表卡片增加阅读量（前端假数据） | 文章列表、阅读量、展示字段 | `ArticlesPreview.jsx`、`styles.css` | 否（首个 Skill） |
| `article-draft-indicator` | 1.0.0 | L2 | 2026-05-21 05:52；`run-2026-05-21T05-52-12-490Z` | §2.2 #3 跨栈：列表与 API 一致展示草稿 | 草稿、draft | frontend + `Article.js` + `articles.js` | 否（仅新增 Skill + registry 注册） |
| `article-detail-word-count` | 1.0.0 | L1 | 2026-05-21 05:52；`run-2026-05-21T05-52-18-277Z` | §2.2 #1 第三模式：详情页字数统计 | 字数、word count、详情页 | `Article.jsx`、`styles.css` | **否**（仅新增 1 个 Skill 文件） |

**Skill 注册**：`services/skills/src/registry.js` — `findSkill()` 按 `appliesWhen` 关键词匹配；无匹配则 fail-fast（见失败 run `run-2026-05-21T05-57-39-036Z`）。

---

## 版本演进时间线（按 run 归档）

| 时间 (UTC) | 事件 | Prompt / Skill | 说明 |
|------------|------|----------------|------|
| 2026-05-20 17:09 | 首批 run | `rules-first-p0` + `article-list-display-field` | 工程骨架跑通 |
| 2026-05-20 17:26–17:37 | Legacy LLM 探索 | doubao + 清晰 L1 输入 | 非 §2.2 #6 验收口径 |
| 2026-05-21 02:16 | 代码级 P0 闭环 | rules + L1 Skill | `run-2026-05-21T02-16-15-215Z` |
| 2026-05-21 05:51 | 历史召回入 plan | rules | `run-2026-05-21T05-51-56-519Z`（§2.2 #5） |
| 2026-05-21 05:52 | L2 + 第 3 Skill | +draft-indicator、+detail-word-count | H10–H12 |
| 2026-05-21 05:57 | 模糊 LLM 迭代 | `1.0.0-llm` | 404 失败 → 澄清成功 → Skill 匹配失败 → 最终通过 |
| 2026-05-21 05:58 | **§2.2 验收 run** | `1.0.0-llm` + `mimo-v2.5` | `run-2026-05-21T05-58-01-181Z` |

---

## 关键 run 与 Prompt/Skill 对应

| Run ID | 模式 | Prompt / 模型 | Skill | 结果 |
|--------|------|---------------|-------|------|
| `run-2026-05-21T02-16-15-215Z` | rules | `rules-first-p0` | `article-list-display-field` | passed |
| `run-2026-05-21T05-51-56-519Z` | rules | `rules-first-p0` | `article-list-display-field` | passed；plan 含 history_references |
| `run-2026-05-21T05-52-12-490Z` | rules | `rules-first-p0` | `article-draft-indicator` | passed；L2 cross_stack |
| `run-2026-05-21T05-52-18-277Z` | rules | `rules-first-p0` | `article-detail-word-count` | passed；第三 Skill |
| `run-2026-05-21T05-57-01-385Z` | llm | 网关 404 | — | failed |
| `run-2026-05-21T05-57-20-736Z` | llm | `mimo-v2.5` | `article-list-display-field` | passed clarify；中文 goal + clarifications |
| `run-2026-05-21T05-57-39-036Z` | llm | `mimo-v2.5` | — | failed；英文 goal 未命中 Skill 关键词 |
| `run-2026-05-21T05-58-01-181Z` | llm | `mimo-v2.5` | `article-list-display-field` | **passed**；§2.2 #4/#6 验收证据 |

---

## 失败驱动的 Prompt / Skill 约束（留痕）

| 失败 run | 原因 | 后续约束 |
|----------|------|----------|
| `run-2026-05-21T05-57-01-385Z` | LLM 网关 404 | 修正 `LLM_BASE_URL` 后重跑 |
| `run-2026-05-21T05-57-39-036Z` | LLM 输出英文 goal，Skill 关键词未匹配 | 保留 fail-fast；答辩 run 仍匹配到 `article-list-display-field` |
| H1 坏归档（3 条） | 缺 `requirement.md` | history-recall 标 `degraded` / `skipped`，不伪装 ready |

---

## 关联材料

- AI 使用说明：[`ai-usage.md`](./ai-usage.md)
- 模糊澄清对话导出：[`clarify-conversation-export.md`](./clarify-conversation-export.md)（S5）
- 开发工具清单：[`tools-manifest.md`](./tools-manifest.md)（S4）
- 验收 run 证据目录：`docs/reports/runs/run-2026-05-21T05-58-01-181Z/`
