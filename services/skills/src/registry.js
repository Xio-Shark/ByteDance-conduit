import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SKILLS_DIR = new URL("./", import.meta.url);
const MIN_SKILL_MATCH_SCORE = 2;
const SKILL_EXPORT_SUFFIX = "Skill";
const APPLY_EXPORT_PREFIX = "apply";

// Auto-discovery: any sibling module exporting a `<name>Skill` definition plus a
// matching `apply<Name>` function is registered automatically. Adding a new
// requirement mode means dropping one file in this directory — no mainline edit
// to import lists or arrays here.
const SKILLS = Object.freeze(await discoverSkills());

async function discoverSkills() {
  const fileNames = await readSkillModuleNames();
  const modules = await Promise.all(
    fileNames.map((fileName) => import(new URL(fileName, SKILLS_DIR).href)),
  );
  return modules
    .map((module, index) => buildSkillFromModule(module, fileNames[index]))
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

async function readSkillModuleNames() {
  const selfName = fileURLToPath(import.meta.url).split("/").at(-1);
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".js"))
    .filter((name) => !name.endsWith(".test.js"))
    .filter((name) => name !== selfName)
    .sort();
}

function buildSkillFromModule(module, fileName) {
  const skillExport = findExport(module, (name) => name.endsWith(SKILL_EXPORT_SUFFIX));
  if (!skillExport) {
    return null; // Helper module (no Skill definition); skip.
  }
  const definition = skillExport.value;
  if (!definition || typeof definition.id !== "string") {
    throw new Error(`Skill module ${fileName} export ${skillExport.name} must define a string id`);
  }
  const applyExport = findExport(
    module,
    (name) => name.startsWith(APPLY_EXPORT_PREFIX) && typeof module[name] === "function",
  );
  if (!applyExport) {
    throw new Error(`Skill module ${fileName} must export an apply* function for ${definition.id}`);
  }
  return Object.freeze({ ...definition, apply: applyExport.value });
}

function findExport(module, predicate) {
  const name = Object.keys(module).find(predicate);
  return name ? { name, value: module[name] } : null;
}

export function findSkill(requirementCard) {
  const text = buildRequirementText(requirementCard);
  const ranked = SKILLS.map((skill) => ({
    skill,
    score: scoreSkillMatch(skill, text),
  }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const [best, second] = ranked;
  if (!best || best.score < MIN_SKILL_MATCH_SCORE) {
    throw new Error(`No Skill matched requirement: ${requirementCard.goal}`);
  }
  if (second?.score === best.score) {
    const candidates = ranked
      .filter((entry) => entry.score === best.score)
      .map((entry) => entry.skill.id)
      .join(", ");
    throw new Error(`Ambiguous Skill match for requirement: ${requirementCard.goal}; candidates: ${candidates}`);
  }
  return best.skill;
}

function buildRequirementText(requirementCard) {
  return [
    requirementCard.source_input,
    requirementCard.goal,
    ...requirementCard.scope.include,
    ...requirementCard.acceptance,
  ]
    .join(" ")
    .toLowerCase();
}

function scoreSkillMatch(skill, text) {
  return skill.appliesWhen.reduce((score, pattern) => {
    const normalized = pattern.toLowerCase();
    if (!text.includes(normalized)) {
      return score;
    }
    const weight = skill.intentWeights?.[pattern] ?? 1;
    return score + weight;
  }, 0);
}

export function listSkills() {
  return SKILLS.map(({ apply, crossStackCheck, ...skill }) => skill);
}
