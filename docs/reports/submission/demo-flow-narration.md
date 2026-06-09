# 演示流程与口播稿

用途：用于 3-8 分钟演示视频和现场答辩 Demo。目标是让评委看到系统不是聊天壳，而是从 PM 需求到 Conduit 真实代码、验证结果和 PR 草稿的端到端交付链路。

建议总时长：6 分钟左右。现场网络或模型不稳定时，用本地已归档 run 做证据展示；不要把未跑通的实时链路说成已跑通。

文档路径：

```text
/Users/xioshark/Desktop/bytedance/bytedance-implementation/docs/reports/submission/demo-flow-narration.md
```

---

## 录制前准备

在实现仓启动：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
npm install
npm install --prefix sandbox-repo
BLOCK_ON_CONFIRM=1 AI_MODE=llm PLAN_MODE=llm npm run dev
```

打开：

```text
http://localhost:5173
```

最终提交前还要补跑并确保通过：

```bash
npm run verify
npm run test:e2e
```

当前若 `verify` 或 E2E 仍有未修复项，录屏时只展示已经通过的分项和历史 run 证据，不要口播“所有门禁已通过”。

---

## 照做版操作步骤

### 1. 启动本地 Demo

打开一个终端窗口，执行：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
BLOCK_ON_CONFIRM=1 AI_MODE=llm PLAN_MODE=llm npm run dev
```

看到 API 和 Web 都启动后，浏览器打开：

```text
http://localhost:5173
```

如果端口被占用，终端会提示 Vite 实际使用的地址，以终端显示的 `Local:` 地址为准。

### 2. 开始录屏

macOS 可按：

```text
Command + Shift + 5
```

选择浏览器窗口或整个屏幕，开始录制。录制前建议把浏览器缩放调到 90%-100%，并关闭无关窗口。

### 3. 展示首页

浏览器停留在控制台首页，画面里要看到：

- 左侧交付阶段
- PM 需求输入框
- 示例 PM 需求按钮
- 跨运行 AI 用量面板

此时按本文档“0:00-0:25 开场”口播。

### 4. 跑一条稳定 MVP 链路

在页面里点击示例按钮：

```text
阅读量展示
```

它会自动把 PM 需求填入输入框并发起运行。等待结果出现后，按顺序滚动页面并展示：

1. `需求` 面板：展示 PM 原始输入、scope、acceptance。
2. `方案` 面板：展示 Skill、目标文件、历史参考。
3. `验证` 面板：展示 `npm run lint:sandbox` 和 `npm run test` 都是 exit 0。
4. `Diff` 面板：展示真实 Conduit 文件变更。
5. `PR 草稿` 面板：展示 PR 标题、文件列表、验证结果和风险。

对应口播见“0:25-1:30 端到端 MVP 链路”。

注意：如果当前 `sandbox-repo` 有历史脏改动，页面里 PR 文件列表可能包含历史文件。录屏时可以补一句：

> 当前 sandbox 里保留了多条演练改动，所以文件列表会包含历史 diff。核心证明看这次 run 的需求、方案、验证和 PR 草稿证据；正式提交前会用干净 fresh clone 复核。

### 5. 展示已归档 LLM 能力证据

再打开一个终端或编辑器窗口，进入实现仓：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
```

按下面顺序展示文件。可以用 Finder、编辑器或终端 `sed` 命令打开；录屏重点是让评委看到路径和关键字段。

多轮澄清：

```bash
sed -n '1,120p' docs/reports/runs/run-l3-multi-turn-clarify/ai-calls.jsonl
sed -n '1,160p' docs/reports/runs/run-l3-multi-turn-clarify/requirement.md
```

Plan 阶段 LLM 和非零 tokens：

```bash
sed -n '1,120p' docs/reports/runs/run-plan-llm-driven/ai-calls.jsonl
sed -n '1,120p' docs/reports/runs/run-plan-llm-driven/run-summary.json
```

跨栈 schema-driven：

```bash
sed -n '1,180p' docs/reports/runs/run-l2-auto-cover-image/plan.md
sed -n '1,120p' services/skills/src/articleCoverImage.js
```

历史方案复用（token 重叠召回）：

```bash
sed -n '1,180p' docs/reports/runs/run-semantic-recall-demo/plan.md
sed -n '1,160p' docs/reports/runs/run-semantic-recall-demo/history-recall.json
```

非文章列表 Skill：

```bash
sed -n '1,140p' services/skills/src/commentLikeCount.js
sed -n '1,160p' docs/reports/runs/run-l2-comment-like/verification.json
```

Skill 注册表：

```bash
sed -n '1,140p' services/skills/src/registry.js
```

这些文件对应本文档 1:30-5:40 的讲解段落。

### 6. 展示提交材料和 AI 留痕

继续展示：

```bash
sed -n '1,120p' docs/reports/submission/ai-usage.md
sed -n '1,120p' docs/reports/submission/prompt-changelog.md
sed -n '1,120p' docs/reports/submission/engineering-notes.md
sed -n '1,120p' docs/reports/submission/architecture.md
```

对应口播见“5:40-6:10 AI 留痕与提交材料”。

### 7. 收尾并停止录屏

回到浏览器首页或 PR 草稿面板，按“6:10-6:25 收尾”口播。讲完后停止录屏。

### 8. 录屏后补 evidence

录屏完成后，需要填写本地视频 evidence：

```text
docs/reports/submission/video-evidence.json
```

然后运行：

```bash
cd /Users/xioshark/Desktop/bytedance/bytedance-implementation
npm run check:video-evidence -- --file docs/reports/submission/video-evidence.json
```

视频上传后，再填写：

```text
docs/reports/submission/external-submission-evidence.json
```

并继续执行公开仓 fresh clone、external submission 和 final gates 校验。

---

## 演示主线

### 0:00-0:25 开场

屏幕操作：

1. 打开 Web 控制台首页。
2. 让画面停在 PM 输入框、阶段列表和跨运行 AI 用量面板。

口播：

> 大家好，我演示的是面向 Conduit 全栈博客项目的 AI 交付系统。它的目标不是生成一段回答，而是把 PM 的自然语言需求，经过澄清、方案拆解、模块定位、真实仓库代码修改、自动化验证，最后收口到可审阅的 PR 草稿。  
> 这个系统分成三层：React 控制台、Node API、以及 Agent / Skill / Orchestrator 编排层。底层写入的是 `sandbox-repo` 里的 Conduit 真实代码，不是 mock 仓库。

要点：

- 明确三端齐备。
- 明确真实 Conduit 仓。
- 不要一开始讲太多技术细节，先让评委知道系统做什么。

---

### 0:25-1:30 端到端 MVP 链路

屏幕操作：

1. 点击一个可交互示例，例如“阅读量展示”。
2. 说明示例按钮会自动填入 PM 需求并触发运行。
3. 等运行结果出现后，依次展示：
   - 需求卡片
   - 方案 / 目标文件
   - diff
   - verification
   - PR 草稿

备用稳定证据：

```text
docs/reports/runs/run-2026-05-21T02-16-15-215Z
```

口播：

> 这里我点击一个示例需求：“给文章列表加阅读量展示，前端假数据即可，不改后端。”按钮不是装饰项，它会把需求写入输入框并自动发起一次交付运行。  
> 系统先把自然语言转成需求卡片，明确包含范围和排除范围。这个需求明确排除后端 schema 和 API，所以后续计划只定位到前端文章卡片和样式文件。  
> 这里可以看到 diff 来自 Conduit 的真实路径，比如 `ArticlesPreview.jsx` 和 `styles.css`。验证阶段执行了 Conduit 相关 lint 和 Vitest，最后生成 PR 草稿。  
> 这条链路覆盖了课题要求里的 PM 输入、澄清、方案、模块定位、代码生成、写入 Conduit、Lint / 单测和 PR 草稿。

要点：

- 重点说“真实路径、真实 diff、真实验证”。
- 主路径走真实 LLM（`AI_MODE=llm PLAN_MODE=llm`），AI Usage 面板有非零 tokens；`rules` 仅作断网应急兜底，那时 tokens 为 0 属正常。

---

### 1:30-2:15 澄清深度：模糊需求不会硬编

屏幕操作：

1. 打开或展示归档 run：

```text
docs/reports/runs/run-l3-multi-turn-clarify
```

2. 展示 `ai-calls.jsonl` 和澄清历史。
3. 如果 UI 中有澄清面板，也展示 PM 答复输入区域。

口播：

> 课题里很看重“澄清深度”，所以系统不会对模糊需求直接硬编。这里的 `run-l3-multi-turn-clarify` 是一个多轮澄清证据。  
> 第一轮模型判断需求边界不清晰，会生成待回答问题；PM 在控制台里补充回答后，系统把这些回答写入澄清历史，再进入第二轮 refine，得到可执行的需求卡片。  
> 这里的关键证据是 `ai-calls.jsonl` 里有 clarify 和 clarify-refine 两段模型调用，说明它不是一次性 prompt，而是真正支持多轮澄清。

要点：

- 说“不会硬编”。
- 说“clarify + refine 两段模型调用”。
- 说“PM 回答被持久化”。

---

### 2:15-2:55 可观测性：AI 用量可追踪

屏幕操作：

1. 展示页面的“跨运行 AI 用量”面板。
2. 展示归档 run：

```text
docs/reports/runs/run-plan-llm-driven
```

3. 指出非零 tokens、延迟和成本估算。

口播：

> 每次 AI 调用都会记录 token、延迟、模型和成本估算，不只是在日志里看。控制台这里有单次运行和跨运行的 AI 用量面板。  
> 这条 `run-plan-llm-driven` 证明 plan 阶段也接入了真实 LLM，`ai-calls.jsonl` 里可以看到 plan 阶段的非零 tokens。  
> 这样答辩时可以解释每次模型调用花在哪里，也能排查某次运行为什么慢或为什么成本高。

要点：

- 不要只说“有监控”，要指具体字段：tokens、latency、cost、stage。

---

### 2:55-3:45 跨栈一致性：schema-driven 变更

屏幕操作：

1. 展示：

```text
docs/reports/runs/run-l2-auto-cover-image
```

2. 打开 `plan.md` 或 diff。
3. 指出后端 model/controller 与前端 type/service/mock/component 都被覆盖。
4. 打开 Skill 文件：

```text
services/skills/src/articleCoverImage.js
```

口播：

> 这一段是 L2 跨栈需求：给文章增加封面图字段。普通做法很容易只改前端或只改后端，造成接口和页面不一致。  
> 这里 Skill 只声明 schema change，也就是 Article 增加 `coverImage` 字段；主流程通过 schema driver 自动推断要改哪些后端和前端文件。  
> diff 里可以看到后端模型和 controller、前端类型、service、mock 和文章卡片展示都被一起更新。这个能力对应课题的跨栈一致性加分项。

要点：

- 强调“Skill 只声明意图，主流程自动推断目标”。
- 不要声称支持任意复杂 schema，只说当前覆盖本项目高频字段类需求。

---

### 3:45-4:25 业务上下文反哺：相似需求召回

屏幕操作：

1. 展示：

```text
docs/reports/runs/run-semantic-recall-demo
```

2. 打开 `plan.md` 或 `history-recall.json`。
3. 指出 `history_references`、`match_type=semantic` 或相似度字段。

口播：

> 系统会把历史需求结构化沉淀。新的需求进来时，不只是用关键词匹配 Skill，还会从历史 run 里复用相似方案。  
> 这条历史方案复用 demo 里，系统基于需求文本的字符 bigram 重叠度，从历史 run 找到相似度最高的旧需求，并把历史方案写入 plan 的 references；`history-recall.json` 里能看到 `match_type` 和相似度分数。  
> 这解决的是 PM 需求吞吐问题：类似需求越多，系统越知道之前怎么拆、怎么验证、踩过哪些坑。

要点：

- 说业务价值：减少重复翻译成本。
- 不要把本地 hash embedding 说成大型向量库。

---

### 4:25-5:05 断点重放与人工介入

屏幕操作：

1. 在 UI 中展示阶段列表和人工确认按钮。
2. 如果当前启动了 `BLOCK_ON_CONFIRM=1`，展示 waiting 阶段、确认/继续入口。
3. 展示 resume-from-stage 相关入口或归档 checkpoint。

口播：

> 课题要求每个阶段都允许人工介入，不是模型一路跑到底。这里开启 `BLOCK_ON_CONFIRM=1` 后，系统会在需求确认或方案确认阶段暂停。  
> 人可以记录 review 结果，再点击继续。更重要的是，如果只改了方案或只想重跑 edit 之后的阶段，可以从指定 stage resume，只重放下游，不需要从澄清阶段全部重来。  
> 这套机制依赖事件和 checkpoint 持久化，所以运行过程可以审计，也可以回放。

要点：

- 关键词：pause、human review、resume downstream、checkpoint。
- 如果现场没跑出 waiting 状态，就用归档证据展示，不要临场硬等。

---

### 5:05-5:40 Skill 抽象：新增模式不改主干

屏幕操作：

1. 展示 Skill 目录：

```text
services/skills/src
```

2. 展示 registry：

```text
services/skills/src/registry.js
```

3. 展示非文章列表 Skill：

```text
services/skills/src/commentLikeCount.js
docs/reports/runs/run-l2-comment-like
```

口播：

> 系统不是把所有逻辑写死在一个大 prompt 里，而是把高频需求模式抽成 Skill。  
> 这里可以看到多个 Skill 文件和统一 registry。以评论点赞为例，它不是文章列表展示类需求，落点在评论域，仍然通过同一条编排链路生成 diff、验证并产出 PR 草稿。  
> 新需求模式的扩展方式是新增 Skill 文件并注册，而不是修改 Orchestrator 主干，这对应课题里的抽象到位要求。

要点：

- 强调“非列表 Skill”证明不是只会一类需求。
- 如果被问现场题，说 U6 已做 3 个限时演练证据。

---

### 5:40-6:10 AI 留痕与提交材料

屏幕操作：

展示 submission 目录里的材料：

```text
docs/reports/submission/ai-usage.md
docs/reports/submission/prompt-changelog.md
docs/reports/submission/engineering-notes.md
docs/reports/submission/architecture.md
docs/reports/submission/defense-prep.md
```

口播：

> 最后是提交材料和 AI 使用留痕。这里保留了 AI 调用记录、Prompt 版本变化、架构说明、工程难点和答辩准备。  
> 密钥不会写入仓库，真实 API key 只通过本地环境变量或部署密钥配置。公开仓也会排除个人团队信息和本地敏感文件。  
> 这部分对应课题 §7.2 的过程留痕和 §8.2 的材料完整度。

要点：

- 明确密钥不入库。
- 明确 AI 使用记录不是口头描述，有文件和 run 证据。

---

### 6:10-6:25 收尾

口播：

> 总结一下，这个项目已经把 PM 自然语言需求接入到真实 Conduit 仓库变更、自动化验证和 PR 草稿，并在澄清、可观测、跨栈一致性、历史召回、断点重放和 Skill 抽象上做了扩展。  
> 现场演示主路径走真实 LLM 链路（`AI_MODE=llm PLAN_MODE=llm`，默认即此），展示真实 token / 延迟 / 成本留痕；`rules` 链路仅作断网应急兜底，并已归档 run 和 ai-calls 作为补充证据。

---

## 现场答辩 30 秒版本

如果时间很短，可以这样讲：

> 这个系统解决的是 PM 需求到研发交付之间的翻译成本。PM 在控制台输入自然语言需求后，系统会先澄清边界，再生成方案，定位 Conduit 真实模块，写入 `sandbox-repo`，运行 lint 和单测，最后生成 PR 草稿。  
> 技术上我把能力拆成 React 控制台、Node API、Orchestrator/Agent/Skill 三层；扩展新需求模式时优先新增 Skill，而不是改主流程。  
> 加分能力包括多轮澄清、断点重放、跨栈 schema-driven 变更、AI token/延迟/成本面板、基于 token 重叠的历史方案复用，以及完整 AI 使用留痕。

---

## 不要这样讲

- 不要说“所有提交项都完成”，除非 `video-evidence.json`、`external-submission-evidence.json`、fresh clone、submission gates 和 pre-submission gate 都已通过。
- 不要说“已经真实创建远端 PR”，除非现场确实配置了 GitHub token 并创建成功。当前主证据是本地 `pr-draft.md`。
- 不要把 rules 模式的 tokens=0 当作可观测性证据。可观测性主证据用 `run-plan-llm-driven`。
- 不要说支持任意需求。更准确的说法是：已覆盖 Conduit 高频模式，并通过 Skill 注册机制扩展。

---

## 录屏后要做的事

1. 保存本地视频文件。
2. 填写：

```text
docs/reports/submission/video-evidence.json
```

3. 运行：

```bash
npm run check:video-evidence -- --file docs/reports/submission/video-evidence.json
```

4. 上传视频，拿到公开视频 URL。
5. 填写：

```text
docs/reports/submission/external-submission-evidence.json
```

6. 重建公开仓 fresh clone，并运行：

```bash
npm run check:public-repo -- --repo <fresh-clone-path>
npm run check:external-submission -- --file docs/reports/submission/external-submission-evidence.json --public-repo <fresh-clone-path>
npm run check:submission-gates -- --public-repo <fresh-clone-path>
PUBLIC_REPO_CLONE_PATH=<fresh-clone-path> bash scripts/pre-submission-check.sh
```
