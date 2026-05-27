# 提交前安全检查报告（S9）

复核时间：**2026-05-22**（archive dry-run 接入 `pre-submission-check.sh`）。对照 §8.2 与 [`docs/03-spec.md`](../../../../docs/03-spec.md#配置与安全规格)：仓库中 **不得** 含真实 API key、EP、Bearer token。

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
| `run-2026-05-21T02-16-15-215Z` | `pr-draft.md` | 无凭据 |
| failure runs | `failure.json` | 网关错误 HTML，无 key |

---

## 4. 依赖安全（交叉引用 X1）

| 范围 | `npm audit`（moderate+） | 结论 |
|------|--------------------------|------|
| 实现仓根 | **0** | ✅ |
| `sandbox-repo/` | **8**（5 high, 3 moderate） | 上游 Conduit 传递依赖；见 [`dependency-audit-decision.md`](./dependency-audit-decision.md) |

实现仓自身依赖无 high+ 漏洞；sandbox 漏洞不阻塞本地演示，公开提交前已在 X1 记录决策。

---

## 5. 验证命令复跑

```bash
cd bytedance-implementation && npm run archive:dry-run
```

| 环节 | 2026-05-22 结果 |
|------|-----------------|
| 候选发布包 dry-run | passed；347 files，7 key runs；输出 manifest/content SHA-256 指纹 |
| 禁入路径 | `.env` / `node_modules` / `apps/web/dist/` / `test-results/` 未进入候选包 |
| 密钥模式扫描 | 未发现 `sk-` / `ghp_` / `Bearer` 长 token 模式 |

说明：archive dry-run 只证明候选发布包内容可枚举且无明显禁入路径；`manifestHash` / `contentHash` 可用于发布日前后比对候选包是否变化，但不替代公开仓 URL、Demo URL、视频 URL、团队信息或最终提交。

```bash
cd bytedance-implementation && npm run verify
```

| 环节 | 2026-05-22 结果（submission readiness 复跑） |
|------|-----------------|
| Node/API/Web/scripts 测试 | **107 pass / 1 skip** |
| sandbox lint | passed |
| Conduit Vitest | 12 passed |
| Web build | passed |

---

## 6. 发布前再检（人工勾选）

公开推送 **当天** 重复（可用 `scripts/pre-submission-check.sh`）：

- [x] `git status` 无 `.env` staged（2026-05-21 复跑）
- [x] 源码/材料 `rg` 无 `sk-` / `ghp_` 明文（2026-05-21 复跑）
- [x] `npm run verify` 全绿（108 项 Node/API/Web/scripts 测试；107 pass / 1 skip + sandbox vitest + web build）
- [x] `npm run archive:dry-run` 通过（2026-05-22；候选包内容检查，不等于远端公开）
- [ ] `scripts/pre-submission-check.sh` 通过（当前会先运行 archive dry-run，再聚合报告 4 类外部门禁阻塞：公开发布清单路径未全部纳入 Git 跟踪、关键源码 / run / submission / sandbox 发布路径仍未准备成 tracked public repository、§8.2 团队/Demo/视频/公开仓占位、最终外部提交未完成；readiness 失败后不会继续跑 `npm run verify`；发布当天填完并确认清单后再勾）
- [ ] `git log -p` 历史无密钥（**首次 push 当天**再勾）
- [ ] README / submission / run 报告复核（**发布当天**）
- [ ] 远端仓库设为 public 后检查 GitHub Secret scanning 告警

---

## 结论

**文档与代码基线复核通过**：tracked 材料中未发现真实 API key/EP 入库。  
**S9 状态：部分完成**；本报告和本地扫描已完成，最终公开推送当日仍须人工重跑脚本、检查 Git 历史和远端 secret scanning。
