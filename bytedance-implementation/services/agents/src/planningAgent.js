export async function buildPlan({ requirementCard, sandbox, skill, historyRecall }) {
  await sandbox.assertFiles(skill.targetPaths);

  const historyReferences = buildHistoryReferences(historyRecall);
  const impactMatrix = buildImpactMatrix(requirementCard, skill);

  return {
    summary: planSummary(requirementCard, skill),
    requirement_id: requirementCard.id,
    skill_id: skill.id,
    skill_version: skill.version,
    impacted_modules: impactMatrix.modules,
    impact_matrix: impactMatrix,
    history_references: historyReferences,
    target_files: skill.targetPaths,
    risks: planRisks(requirementCard, skill),
    validation_commands: skill.validation,
  };
}

function planSummary(requirementCard, skill) {
  if (skill.id === "article-draft-indicator") {
    return "在 Conduit 文章列表与 API 响应中展示草稿状态（前后端一致）。";
  }
  if (skill.id === "article-detail-word-count") {
    return "在文章详情页基于 Article.body 展示字数统计。";
  }
  return "在 Conduit 文章列表卡片增加确定性阅读量展示。";
}

function planRisks(requirementCard, skill) {
  const risks = [
    "Conduit 根仓没有 lint script 时由实现仓库 ESLint 检查本次改动文件",
  ];
  if (requirementCard.level === "L2") {
    risks.push("L2 跨栈改动须保持 API 字段与前端展示一致");
  } else {
    risks.push("P0 只展示前端假数据，不代表真实阅读量统计");
  }
  return risks;
}

function buildHistoryReferences(historyRecall) {
  if (!historyRecall?.matches?.length) return [];
  return historyRecall.matches.map((match) => ({
    run_id: match.runId,
    goal: match.goal,
    skill_id: match.skillId,
    score: match.score,
    summary: match.summary,
  }));
}

function buildImpactMatrix(requirementCard, skill) {
  const frontend = skill.targetPaths.filter((file) => file.startsWith("frontend/"));
  const backend = skill.targetPaths.filter((file) => file.startsWith("backend/"));
  const modules = [];
  if (frontend.length) modules.push("frontend");
  if (backend.length) modules.push("backend");
  if (!modules.length) modules.push("frontend article preview", "global styles");

  return {
    level: requirementCard.level,
    modules,
    frontend_paths: frontend,
    backend_paths: backend,
    cross_stack: frontend.length > 0 && backend.length > 0,
  };
}
