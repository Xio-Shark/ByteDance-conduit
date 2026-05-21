import {
  applyArticleListDisplayField,
  articleListDisplayFieldSkill,
} from "./articleListDisplayField.js";
import {
  applyArticleDraftIndicator,
  articleDraftIndicatorSkill,
} from "./articleDraftIndicator.js";
import {
  applyArticleDetailWordCount,
  articleDetailWordCountSkill,
} from "./articleDetailWordCount.js";

const SKILLS = Object.freeze([
  {
    ...articleDraftIndicatorSkill,
    apply: applyArticleDraftIndicator,
  },
  {
    ...articleDetailWordCountSkill,
    apply: applyArticleDetailWordCount,
  },
  {
    ...articleListDisplayFieldSkill,
    apply: applyArticleListDisplayField,
  },
]);

export function findSkill(requirementCard) {
  const text = [
    requirementCard.source_input,
    requirementCard.goal,
    ...requirementCard.scope.include,
    ...requirementCard.acceptance,
  ].join(" ");

  const skill = SKILLS.find((item) =>
    item.appliesWhen.some((pattern) => text.includes(pattern)),
  );

  if (!skill) {
    throw new Error(`No Skill matched requirement: ${requirementCard.goal}`);
  }
  return skill;
}

export function listSkills() {
  return SKILLS.map(({ apply, ...skill }) => skill);
}
