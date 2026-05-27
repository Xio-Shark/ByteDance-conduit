import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildPlan } from "./planningAgent.js";
import { articleDraftIndicatorSkill } from "../../skills/src/articleDraftIndicator.js";
import { articleListDisplayFieldSkill } from "../../skills/src/articleListDisplayField.js";

test("buildPlan marks L2 cross-stack impact matrix for draft indicator Skill", async () => {
  const repoPath = await createSandboxRepo(articleDraftIndicatorSkill.targetPaths);
  const plan = await buildPlan({
    requirementCard: {
      id: "REQ-L2-ARTICLE-DRAFT",
      goal: "文章列表与 API 展示草稿状态",
      level: "L2",
    },
    sandbox: createAssertingSandbox(articleDraftIndicatorSkill.targetPaths),
    skill: articleDraftIndicatorSkill,
    historyRecall: { matches: [] },
    repoPath,
  });

  assert.equal(plan.impact_matrix.cross_stack, true);
  assert.deepEqual(plan.impact_matrix.modules, ["frontend", "backend"]);
  assert.ok(plan.impact_matrix.frontend_paths.length > 0);
  assert.ok(plan.impact_matrix.backend_paths.length > 0);
  assert.match(plan.summary, /草稿/);
});

test("buildPlan keeps L1 impact matrix frontend-only for display field Skill", async () => {
  const repoPath = await createSandboxRepo(articleListDisplayFieldSkill.targetPaths);
  const plan = await buildPlan({
    requirementCard: {
      id: "REQ-001",
      goal: "文章列表卡片展示阅读量",
      level: "L1",
    },
    sandbox: createAssertingSandbox(articleListDisplayFieldSkill.targetPaths),
    skill: articleListDisplayFieldSkill,
    historyRecall: { matches: [] },
    repoPath,
  });

  assert.equal(plan.impact_matrix.cross_stack, false);
  assert.deepEqual(plan.impact_matrix.modules, ["frontend"]);
  assert.equal(plan.impact_matrix.backend_paths.length, 0);
});

test("buildPlan writes history references from recall matches", async () => {
  const repoPath = await createSandboxRepo(articleListDisplayFieldSkill.targetPaths);
  const plan = await buildPlan({
    requirementCard: {
      id: "REQ-001",
      goal: "文章列表卡片展示阅读量",
      level: "L1",
    },
    sandbox: createAssertingSandbox(articleListDisplayFieldSkill.targetPaths),
    skill: articleListDisplayFieldSkill,
    repoPath,
    historyRecall: {
      matches: [
        {
          runId: "run-2026-05-21T05-51-56-519Z",
          goal: "文章列表卡片展示阅读量",
          skillId: "article-list-display-field",
          score: 1,
          summary: "在 Conduit 文章列表卡片增加确定性阅读量展示。",
        },
      ],
    },
  });

  assert.equal(plan.history_references.length, 1);
  assert.equal(plan.history_references[0].run_id, "run-2026-05-21T05-51-56-519Z");
});

test("buildPlan rejects PLAN_MODE=llm because planning calls are not persisted", async () => {
  const repoPath = await createSandboxRepo(articleListDisplayFieldSkill.targetPaths);
  await assert.rejects(
    () => buildPlan({
      requirementCard: {
        id: "REQ-001",
        goal: "文章列表卡片展示阅读量",
        level: "L1",
      },
      sandbox: createAssertingSandbox(articleListDisplayFieldSkill.targetPaths),
      skill: articleListDisplayFieldSkill,
      historyRecall: { matches: [] },
      repoPath,
      env: { PLAN_MODE: "llm" },
    }),
    /PLAN_MODE=llm is not supported/,
  );
});

test("buildPlan requires a real sandbox repo path", async () => {
  await assert.rejects(
    () => buildPlan({
      requirementCard: {
        id: "REQ-001",
        goal: "文章列表卡片展示阅读量",
        level: "L1",
      },
      sandbox: createAssertingSandbox(articleListDisplayFieldSkill.targetPaths),
      skill: articleListDisplayFieldSkill,
      historyRecall: { matches: [] },
    }),
    /requires a sandbox repo path/,
  );
});

function createAssertingSandbox(targetPaths) {
  return {
    async assertFiles(paths) {
      assert.deepEqual(paths, targetPaths);
    },
  };
}

async function createSandboxRepo(targetPaths) {
  const repoPath = await mkdtemp(path.join(os.tmpdir(), "planning-agent-sandbox-"));
  await Promise.all(targetPaths.map((targetPath) => writeTargetFile(repoPath, targetPath)));
  return repoPath;
}

async function writeTargetFile(repoPath, targetPath) {
  const filePath = path.join(repoPath, targetPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, "export const marker = true;\n", "utf8");
}
