# 提交前安全检查报告（S9）

复核时间：**2026-06-06**（archive dry-run、fresh clone public repo check、Q&A gate、本地敏感模式扫描、依赖审计与 GitHub secret scanning API 已复跑）。对照 §8.2 与 [`docs/03-spec.md`](../../../../docs/03-spec.md#配置与安全规格)：仓库中 **不得** 含真实 API key、EP、Bearer token。

> 本报告为文档仓内静态扫描 + 本地命令结果；发布公开仓前须再执行一次相同检查。

---

## 1. 密钥文件与 .gitignore

| 检查项 | 结果 |
|--------|------|
| 根 `.gitignore` 忽略 `.env` / `.env.*` | ✅ |
| 实现仓 `.gitignore` 忽略 `.env` | ✅ |
| `sandbox-repo/.gitignore` 忽略 `.env*` | ✅ |
| `.env.example` 仅占位符 | ✅ |
| 本地 `.env` 存在但未跟踪 | ✅（应在发布前确认 never committed） |

---

## 2. 源码与材料明文扫描

扫描范围：实现仓 + 文档仓 tracked 文件（排除 `node_modules`）。

| 模式 | 结果 |
|------|------|
| `sk-…` 长 key | 未发现 |
| `ghp_…` GitHub PAT | 未发现 |
| `LLM_API_KEY=<非空真实值>` | 未发现（仅 `.env.example` 注释与测试用 `test-key`） |
| `GITHUB_TOKEN=<非空真实值>` | 未发现 |
| run 报告 / submission 中 Bearer | 未发现 |

测试文件 `llmClient.test.js` 使用 `LLM_API_KEY: "test-key"` — 为单测占位，非生产密钥。

---

## 3. run 证据抽查

| Run | 文件 | 结果 |
|-----|------|------|
| `run-2026-05-21T05-58-01-181Z` | `ai-calls.jsonl` | 仅 tokens/model，无 key |
| `run-l3-multi-turn-clarify` | `ai-calls.jsonl` / `clarification-history.jsonl` | 仅 tokens/model/PM 答复摘要，无 key |
| `run-plan-llm-driven` | `ai-calls.jsonl` | 仅 tokens/model/plan 摘要，无 key |
| `run-2026-05-21T02-16-15-215Z` | `pr-draft.md` | 无凭据 |
| failure runs | `failure.json` | 网关错误 HTML，无 key |

---

## 4. 依赖安全（交叉引用 X1）

| 范围 | `npm audit`（moderate+） | 结论 |
|------|--------------------------|------|
| 实现仓根 | **0** | ✅ |
| `sandbox-repo/` 根 | **15**（1 critical, 8 high, 6 moderate） | 上游 Conduit 传递依赖；见 [`dependency-audit-decision.md`](./dependency-audit-decision.md) |
| `sandbox-repo/frontend` | **7**（5 high, 2 moderate） | 上游 Conduit 前端依赖；不在本 AI 系统收口中静默升级 |
| `sandbox-repo/backend` | **7**（3 high, 4 moderate） | 上游 Conduit 后端依赖；`sequelize` 强制修复会引入破坏性版本变化 |

实现仓自身依赖无 high+ 漏洞；sandbox 漏洞不阻塞本地演示，公开提交前已在 X1 记录决策。

---

## 5. 验证命令复跑

```bash
cd bytedance-implementation && npm run archive:dry-run
```

| 环节 | 2026-06-06 结果 |
|------|-----------------|
| 候选发布包 dry-run | passed；475 files，12 key runs，含四类 evidence 模板、Q&A rehearsal evidence 与 local demo browser check；`manifestHash=c290b7e6e6cd6e2be0ddfbcd71b70c4dc086fe87a5f105cd05b3b4bad4e609d6`，`contentHash` 以最新 dry-run 输出为准（状态文档写入会改变内容哈希） |
| 禁入路径 | `.env` / `node_modules` / `apps/web/dist/` / `test-results/` 未进入候选包 |
| 密钥模式扫描 | 未发现 `sk-` / `ghp_` / `Bearer` 长 token 模式；`rg` 仅命中本报告中对 `LLM_API_KEY` / `GITHUB_TOKEN` 的说明文本 |

```bash
cd bytedance-implementation && npm run check:public-repo -- --repo /tmp/ByteDance-conduit-fresh
```

| 环节 | 2026-06-06 结果 |
|------|-----------------|
| Fresh clone 内容检查 | passed；fresh clone Git clean，162 required paths present，0 forbidden paths，secret-patterns none |

```bash
gh api repos/Xio-Shark/ByteDance-conduit/secret-scanning/alerts --jq 'length'
```

| 环节 | 2026-06-06 结果 |
|------|-----------------|
| GitHub secret scanning alerts | 0；当前 token 可读该 API，未发现告警 |

```bash
cd bytedance-implementation && npm run check:defense-rehearsal -- --file docs/reports/submission/defense-rehearsal-evidence.json
```

| 环节 | 2026-06-06 结果 |
|------|-----------------|
| Q&A defense rehearsal | passed；106/106 checks，覆盖 architecture、U1-U6 与 submission boundary |

说明：archive dry-run 只证明候选发布包内容可枚举且无明显禁入路径；`manifestHash` / `contentHash` 可用于发布日前后比对候选包是否变化，但不替代公开仓 URL、Demo URL、视频 URL 或最终提交。

```bash
cd bytedance-implementation && npm run verify
```

| 环节 | 2026-06-01 结果（submission readiness 复跑） |
|------|-----------------|
| Node/API/Web/scripts 测试 | **527 tests；526 pass / 1 skip** |
| sandbox lint | passed |
| Conduit Vitest | 12 passed |
| Web build | passed |

远端公开后，对 fresh clone 再运行：

```bash
cd bytedance-implementation && npm run check:public-repo -- --repo <fresh-clone-path>
cd bytedance-implementation && npm run check:external-submission
cd bytedance-implementation && npm run check:submission-gates -- --public-repo <fresh-clone-path>
```

`check:public-repo` 会验证 fresh clone 的 required 路径、12 条关键 run 证据、submission 占位符、禁入路径、常见 secret 模式、`example.*` / `REPLACE_WITH` 占位链接和 Git clean 状态；`check:external-submission` 会验证本地记录的团队、Demo、视频、公开仓、fresh clone 路径与 passed 状态、远端 secret scanning 与最终提交确认，并在提供 `PUBLIC_REPO_CLONE_PATH` / `--public-repo` 时要求 evidence 中路径与发布日 fresh clone 路径一致，同时拒绝明显占位 URL；`check:submission-gates` 会把 archive、U6、视频、外部证据、Q&A、fresh clone 与 pre-submission blocker 汇总成统一 JSON，包含 `openPlanItems`、每个 gate / blocker 的 `planItems` 与 `requiredEvidence`。三者都不创建或证明公开仓 URL、Demo URL 或视频 URL。

---

## 6. 发布前再检（人工勾选）

公开推送 **当天** 重复（最终门禁使用 `PUBLIC_REPO_CLONE_PATH=<fresh-clone-path> bash scripts/pre-submission-check.sh`）：

- [x] `git status` 无 `.env` staged（2026-05-21 复跑）
- [x] 源码/材料 `rg` 无 `sk-` / `ghp_` 明文（2026-05-21 复跑）
- [x] `npm run verify` / 本地门禁全绿（`npm test` 527 项；526 pass / 1 skip + sandbox lint + Conduit Vitest 12 项 + web build）
- [x] `npm run archive:dry-run` 通过（2026-06-06；候选包内容检查，不等于远端公开；475 files / 12 key runs，`manifestHash=c290b7e6e6cd6e2be0ddfbcd71b70c4dc086fe87a5f105cd05b3b4bad4e609d6`，`contentHash` 以最新 dry-run 输出为准）
- [ ] `npm run check:submission-gates -- --public-repo <fresh-clone-path>` 通过（2026-06-06 复跑仍 failed；archive、U6、Q&A rehearsal 与 fresh clone public repo check 已通过；剩余 blocker 为本地视频证据、external submission evidence、pre-submission gate 中的 Git tracking / final materials / video / external 证据）
- [ ] `PUBLIC_REPO_CLONE_PATH=<fresh-clone-path> bash scripts/pre-submission-check.sh` 通过（当前会先运行 archive dry-run，再聚合报告：公开发布清单路径未全部纳入 Git 跟踪、关键源码 / run / submission / sandbox 发布路径仍未准备成 tracked public repository、最终 external submission checklist 未完成、本地视频证据缺失或不完整、外部提交证据 JSON 缺失或不完整；readiness 失败后不会继续跑 `npm run verify`；发布当天填完并确认清单后再勾）
- [ ] 远端 fresh clone 内容检查通过（发布到 `ByteDance-conduit` 后对 fresh clone 执行 `npm run check:public-repo -- --repo ...`；仍需人工复核公开 URL、Demo 和视频）
- [x] `git log --all -p` 历史敏感模式扫描无命中（2026-05-24；首次 push 当天如新增 commit 需重跑）
- [ ] README / submission / run 报告复核（**发布当天**）
- [x] 远端仓库 GitHub Secret scanning 告警检查（2026-06-06：`gh api .../secret-scanning/alerts --jq 'length'` 返回 0）

---

## 结论

**文档与代码基线复核通过**：tracked 材料中未发现真实 API key/EP 入库。  
**S9 状态：部分完成**；本报告、本地扫描、fresh clone 内容检查、依赖审计和远端 secret scanning 告警读取已完成。最终仍受 Git tracking、视频证据、external submission evidence 与 `pre-submission-check.sh` 失败项阻塞。
