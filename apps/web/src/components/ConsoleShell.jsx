import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  GitPullRequest,
  Loader2,
  Play,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { CrossRunAiUsagePanel } from "./CrossRunAiUsagePanel.jsx";
import { ErrorNotice, RunResult } from "./RunResult.jsx";
import { requireRunEvents } from "./runEvidenceState.js";
import { buildRunResultActions } from "./runResultActions.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STAGES = [
  { id: "clarify", eventStage: "clarifying", label: "需求澄清" },
  { id: "plan", eventStage: "planning", label: "方案拆解" },
  { id: "edit", eventStage: "editing", label: "代码修改" },
  { id: "verify", eventStage: "verifying", label: "验证" },
  { id: "pr", eventStage: "pr_drafting", label: "PR" },
];

const CAPABILITIES = [
  {
    className: "wide",
    title: "需求理解",
    body: "先把 PM 意图整理成可审阅的需求卡片，再进入代码修改。",
  },
  {
    title: "可重放流程",
    body: "关键节点可复用，上游证据稳定后再重跑下游工作。",
  },
  {
    title: "真实仓写入",
    body: "Diff 与验证证据来自 Conduit sandbox 的真实改动。",
  },
  {
    className: "wide shallow",
    title: "AI 用量可观测",
    body: "跨运行展示 token、延迟、模型与成本轨迹。",
  },
];

const HERO_WORDS = [
  "把需求澄清、",
  "方案拆解、",
  "真实仓写入、",
  "验证与",
  "PR",
  "草稿",
  "压进一个",
  "可审计的",
  "工作台。",
];

const EXAMPLE_PROMPTS = [
  {
    id: "read-count",
    input: "给文章列表加阅读量展示，前端假数据即可，不改后端。",
    label: "阅读量展示",
    level: "L1",
    summary: "纯前端字段",
  },
  {
    id: "popular-tags",
    input: "给 Popular Tags 侧边栏前 5 个标签打醒目标记。",
    label: "标签 Top 5",
    level: "L1",
    summary: "侧边栏增强",
  },
  {
    id: "cover-image",
    input: "为文章模型新增封面图字段，新建/编辑表单支持输入 URL，列表和详情页展示。",
    label: "封面图字段",
    level: "L2",
    summary: "跨栈字段",
  },
  {
    id: "comment-like",
    input: "为评论增加点赞计数和点赞按钮，后端保存 likeCount，前端展示并可点击。",
    label: "评论点赞",
    level: "L2",
    summary: "接口 + UI",
  },
];

export function ConsoleLayout({ actions, consoleState }) {
  const { loading, run } = consoleState;
  const shellRef = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.set(".motion-rise, .stage-motion, .panel", {
        clearProps: "opacity,visibility",
      });

      gsap.from(".motion-rise", {
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        y: 22,
        clearProps: "transform",
      });

      gsap.from(".stage-motion", {
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.06,
        x: -14,
        clearProps: "transform",
      });

      gsap.fromTo(
        ".lede-word",
        { opacity: 0.62 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: {
            end: "bottom top+=80",
            scrub: true,
            start: "top top+=180",
            trigger: ".topbar",
          },
        },
      );

      gsap.utils.toArray(".panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.985 },
          {
            duration: 0.75,
            ease: "power2.out",
            scale: 1,
            clearProps: "transform",
            scrollTrigger: {
              end: "bottom 45%",
              scrub: 0.45,
              start: "top 92%",
              trigger: panel,
            },
          },
        );
      });
    },
    { scope: shellRef },
  );

  return (
    <main className="shell" ref={shellRef}>
      <nav className="nav-shell motion-rise" aria-label="控制台状态">
        <a className="brand-mark" href="/">
          <span>Conduit</span>
          <strong>超级个体</strong>
        </a>
        <StatusBadge run={run} loading={loading} />
      </nav>

      <section className="topbar motion-rise">
        <div className="hero-copy">
          <p className="eyebrow">Conduit 交付控制台</p>
          <h1>
            PM 到 PR 的端到端
            <span className="inline-image" aria-hidden="true" />
            交付控制台
          </h1>
          <HeroLede />
        </div>
        <CapabilityGrid />
      </section>

      <section className="workspace motion-rise">
        <aside className="rail">
          <div className="rail-heading">
            <Sparkles />
            <span>交付阶段</span>
          </div>
          <StageList run={run} loading={loading} />
        </aside>

        <MainPanel actions={actions} consoleState={consoleState} />
      </section>
    </main>
  );
}

function MainPanel({ actions, consoleState }) {
  const { error, input, loading, prRefs, run, setInput, setPrRefs, submission } = consoleState;

  async function runExample(exampleInput) {
    setInput(exampleInput);
    await actions.start(exampleInput);
  }

  return (
    <section className="main-panel">
      <div className="command-card motion-rise">
        <div className="command-copy">
          <GitPullRequest />
          <div>
            <span>运行需求</span>
            <strong>把一条 PM 需求转成可审阅的交付运行。</strong>
          </div>
        </div>
        <ExamplePrompts loading={loading} onRunExample={runExample} />
        <div className="input-row">
          <textarea
            aria-label="PM 需求"
            placeholder="输入 PM 需求，例如：给文章列表加阅读量展示，前端假数据即可，不改后端。"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button disabled={loading} onClick={() => actions.start()} title="开始运行" type="button">
            {loading ? <Loader2 className="spin" /> : <Play />}
            <span>{loading ? "运行中" : "开始运行"}</span>
          </button>
        </div>
      </div>

      {error ? <ErrorNotice message={error} /> : null}
      <CrossRunAiUsagePanel />
      {run ? (
        <RunResult
          actions={buildRunResultActions(actions)}
          loading={loading}
          onPrRefsChange={setPrRefs}
          prRefs={prRefs}
          run={run}
          submission={submission}
        />
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function ExamplePrompts({ loading, onRunExample }) {
  return (
    <div className="example-prompts" aria-label="示例 PM 需求">
      {EXAMPLE_PROMPTS.map((example) => (
        <button
          aria-label={`运行示例：${example.label}`}
          className="example-button"
          disabled={loading}
          key={example.id}
          onClick={() => onRunExample(example.input)}
          title={example.input}
          type="button"
        >
          <Play />
          <span>
            <small>{example.level}</small>
            <strong>{example.label}</strong>
            <em>{example.summary}</em>
          </span>
        </button>
      ))}
    </div>
  );
}

function HeroLede() {
  return (
    <p className="hero-lede">
      {HERO_WORDS.map((word) => (
        <span className="lede-word" key={word}>{word}</span>
      ))}
    </p>
  );
}

function CapabilityGrid() {
  return (
    <div className="capability-grid" aria-label="控制台能力">
      {CAPABILITIES.map((item) => (
        <article className={`capability-card ${item.className || ""}`} key={item.title}>
          <span>{item.title}</span>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ loading, run }) {
  if (loading) return <span className="badge running">运行中</span>;
  if (!run) return <span className="badge idle">待运行</span>;
  if (run.status === "failed") return <span className="badge failed">失败</span>;
  if (run.status === "paused") return <span className="badge running">已暂停</span>;
  return <span className="badge ready">{runStageLabel(run.stage)}</span>;
}

function StageList({ loading, run }) {
  const events = run ? requireRunEvents(run) : [];
  const seenStages = new Set(events.map((event) => event.stage));
  const failedStage = findFailedStage(run);

  return (
    <ol className="stages">
      {STAGES.map((stage) => (
        <li className={`${stageClass(stage, seenStages, failedStage)} stage-motion`} key={stage.id}>
          <CheckCircle2 />
          <span>{stage.label}</span>
        </li>
      ))}
      {loading ? (
        <li className="active stage-motion">
          <Loader2 className="spin" />
          <span>执行中</span>
        </li>
      ) : null}
    </ol>
  );
}

function stageClass(stage, seenStages, failedStage) {
  if (!seenStages.has(stage.eventStage)) return "";
  if (failedStage === stage.eventStage) return "failed-step";
  return "done";
}

function findFailedStage(run) {
  if (run?.status !== "failed") return null;
  const events = requireRunEvents(run);
  const failedIndex = events.findLastIndex((event) => event.stage === "failed");
  if (failedIndex <= 0) return "failed";
  return events[failedIndex - 1].stage;
}

function runStageLabel(stage) {
  const labels = {
    clarifying: "需求澄清",
    clarifying_awaiting_answer: "等待澄清回答",
    created: "已创建",
    editing: "代码修改",
    failed: "失败",
    planning: "方案拆解",
    pr_drafting: "PR 草稿",
    ready_for_pr: "待提交 PR",
    verifying: "验证",
    waiting_plan_confirm: "等待方案确认",
    waiting_requirement_confirm: "等待需求确认",
  };
  return labels[stage] || stage;
}

function EmptyState() {
  return (
    <div className="empty">
      <ScrollText />
      <div>
        <strong>等待第一次交付运行</strong>
        <p>运行后这里会展示需求卡片、方案、diff、验证结果和 PR 草稿。</p>
      </div>
    </div>
  );
}
