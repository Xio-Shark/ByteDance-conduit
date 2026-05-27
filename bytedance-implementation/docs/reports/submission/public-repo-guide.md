# 公开仓库发布指南（S8）

§8.2 要求：**AI 系统主仓公开**，且内含 **`sandbox-repo/` Conduit 代码目录**。本文档说明结构与发布检查清单；**不在此执行 GitHub 推送**（按用户要求跳过远端提交）。

这里的“公开仓”指公开 `bytedance-implementation/` 这个实现仓，不是向 `TonyMckes/conduit-realworld-example-app` 上游仓库直接提交 PR。真实 draft PR / 上游 PR 是 H17 可选远端能力，当前最小提交不依赖它。

---

## 双仓分工（答辩口径）

| 仓库 | 角色 | §8.2 是否必须公开 |
|------|------|-------------------|
| `bytedance-implementation/` | **AI 系统主仓**（Web + API + Orchestrator + Agents + Skills + 证据） | **是** |
| `bytedance-implementation/sandbox-repo/` | Conduit 代码目录，Skill 改动的真实目标 | **是**（须在主仓内） |
| `bytedance/`（文档仓） | 设计基线 `docs/01`–`12` | 否（可在 README 附链接） |

评审应能从 **一个公开 AI 主仓** 克隆后本地 `npm run verify` 并查看 Conduit diff 来源。

---

## 推荐公开目录结构

```text
conduit-super-individual/          # 公开 AI 主仓根
├── README.md                      # 启动、配置、API、完成判定
├── .env.example                   # 无真实 key
├── apps/web/
├── apps/api/
├── services/
├── external/git-provider/
├── docs/reports/
│   ├── runs/                      # run 证据（含 §2.2 验收 run）
│   └── submission/                # 本目录全部提交材料
├── sandbox-repo/                  # Conduit clone（须一并公开）
│   ├── frontend/
│   ├── backend/
│   └── package.json
└── package.json
```

`sandbox-repo/` 可采用：**同仓子目录**（当前实现）、git submodule、或 subtree — 推荐保持当前 **子目录** 以降低评审克隆成本。

---

## 发布前检查清单

### 必须包含

- [ ] `README.md`：依赖、启动、`AI_MODE`、验证命令
- [ ] `.env.example`（**无**真实 `LLM_API_KEY` / `GITHUB_TOKEN`）
- [ ] `sandbox-repo/` 完整且 `npm install` 可执行
- [ ] `docs/reports/submission/` 全套材料
- [ ] 至少一条 L1 + 一条 §2.2 LLM 验收 run 证据目录

### 必须排除（见 [`security-check-report.md`](./security-check-report.md)）

- [ ] 根目录 `.env`、任何 `*.pem`、真实 token
- [ ] 运行报告中的 Bearer / API key 明文

### 建议 README 补充段落

```markdown
## 设计基线

课题设计文档见：[文档仓链接]（可选）

## Conduit 来源

sandbox-repo 基于 TonyMckes/conduit-realworld-example-app fork/clone。
```

---

## 本地验证（发布前最后一道）

```bash
cd bytedance-implementation
npm run verify
npm run run:p0
# 可选：npm run run:fuzzy-llm（须本地 .env）
```

---

## 发布内容校验（必须人工确认）

本地目录存在不等于公开仓会包含它。发布前必须分别完成本地候选包校验、Git 跟踪清单校验和远端公开仓人工复核。

候选归档检查：

```bash
npm run archive:dry-run
```

该命令读取 [`scripts/archive-manifest.json`](../../../scripts/archive-manifest.json)，枚举将进入候选发布包的实现源码、submission 材料、`sandbox-repo/` 与关键 run 证据，并拒绝 `.env`、`node_modules`、Web build 产物、测试结果目录和常见密钥模式。输出中的 `manifestHash` 是候选路径清单 SHA-256，`contentHash` 是路径 + 内容 SHA-256，可用于发布日前后比对候选包是否变化。它只证明**本地候选包内容可枚举且无明显禁入路径**，不替代公开仓 URL、Demo URL、视频 URL、团队信息或最终提交。

Git 跟踪清单检查：

完整门禁由 `scripts/pre-submission-check.sh` 从 `scripts/archive-manifest.json` 读取 required 路径，并检查关键 run 证据文件是否已被 Git 跟踪。下面命令只是人工抽查常见关键路径：

```bash
git ls-files --error-unmatch \
  README.md \
  package.json \
  apps/api/src/app.js \
  apps/api/src/apiErrors.js \
  apps/api/src/runExecutionRoutes.js \
  apps/api/src/runEvidenceRoutes.js \
  apps/api/src/runReviewRoutes.js \
  apps/api/src/runRoutes.js \
  apps/api/src/systemRoutes.js \
  apps/web/src/App.jsx \
  apps/web/src/useConsoleController.js \
  apps/web/src/components/ConsoleShell.jsx \
  services/orchestrator/src/orchestrator.js \
  services/agents/src/requirementAgent.js \
  services/skills/src/registry.js \
  services/checks/src/crossStackSync.js \
  scripts/pre-submission-check.sh \
  docs/reports/submission/checklist.md \
  sandbox-repo/package.json
```

如果上述命令报 `pathspec` / `error-unmatch`，说明该路径尚未被 Git 跟踪；公开前必须先纳入发布清单或改用明确的 archive 打包流程。`git status --short` 中的 `?? sandbox-repo/`、`?? docs/reports/runs/...`、`?? scripts/` 都不能当作已发布证据。远端仓库发布后还必须 fresh clone 复核 `sandbox-repo/`、关键 run 证据和 submission 文档实际存在；本地 archive dry-run 不替代这一步。

---

## 发布步骤（人工，不在 Agent 范围）

1. 在 GitHub/GitLab 创建 **public** 仓库（AI 主仓）。
2. 确认 `.gitignore` 含 `.env`；`git status` 无密钥文件。
3. 执行 `bash scripts/pre-submission-check.sh` 和上方发布内容抽查，确认 `sandbox-repo/`、关键 run、submission 文档和脚本已纳入候选包和 Git 跟踪清单。
4. 公开后 fresh clone 远端仓库，复核 `sandbox-repo/`、关键 run、submission 文档和脚本实际存在。
5. 将公开 URL 写入 [`team-info.md`](./team-info.md)。
6. 可选：文档仓单独公开或仅在主仓 README 链接。

---

## 当前状态（2026-05-21）

| 项 | 状态 |
|----|------|
| 本地 monorepo git | 有历史 commit；当前存在大量未跟踪实现 / run / submission 路径，公开前须按上方清单确认发布内容 |
| 远端公开 URL | _（待人工创建并填写）_ |
| `npm run archive:dry-run` | ✅ 通过；候选包包含关键源码、submission、`sandbox-repo/`、脚本测试与 7 条关键 run（347 files，并输出 manifest/content hash）；不等于公开仓已发布 |
| `sandbox-repo/` 在本地目录 | ✅ 已存在；公开仓是否包含仍待远端发布后 fresh clone 验证 |
| `npm run verify` | ✅ 108 项 Node/API/Web/scripts 测试（107 pass / 1 skip）+ sandbox lint + Vitest + Web build |
