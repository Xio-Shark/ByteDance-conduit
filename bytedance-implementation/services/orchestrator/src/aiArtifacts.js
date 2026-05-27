import { buildRequirement } from "../../agents/src/requirementAgent.js";
import { clarifyWithLlm } from "../../agents/src/clarifyWithLlm.js";
import { createLlmClient } from "./llmClient.js";

const RULES_MODE = "rules";
const LLM_MODE = "llm";
const RULES_PROMPT_VERSION = "rules-first-p0";

export async function buildAiArtifacts({ env = process.env, input, modelClient }) {
  const mode = requireAiMode(env);

  if (mode === RULES_MODE) {
    return buildRulesArtifacts(input);
  }

  if (mode === LLM_MODE) {
    return buildLlmArtifacts({
      env,
      input,
      modelClient: modelClient || createLlmClient(env),
    });
  }

  throw new Error(`Unsupported AI_MODE: ${mode}. Use "rules" or "llm".`);
}

function requireAiMode(env) {
  if (typeof env.AI_MODE !== "string" || env.AI_MODE.trim() === "") {
    throw new Error('AI_MODE is required. Use "rules" for local P0 or "llm" for LLM clarify.');
  }
  return env.AI_MODE.trim().toLowerCase();
}

function buildRulesArtifacts(input) {
  const requirementCard = buildRequirement(input);
  return {
    mode: RULES_MODE,
    requirementCard,
    aiCalls: [
      {
        stage: "clarify",
        model: "rules-first-p0",
        prompt_version: RULES_PROMPT_VERSION,
        input_summary: truncate(requirementCard.source_input, 240),
        output_summary: truncate(requirementCard.goal, 240),
        tokens_in: 0,
        tokens_out: 0,
        latency_ms: 0,
        cost_estimate: 0,
        status: "reviewed",
      },
    ],
  };
}

async function buildLlmArtifacts({ env, input, modelClient }) {
  const { requirementCard, aiCall } = await clarifyWithLlm({ input, modelClient });

  return {
    mode: LLM_MODE,
    requirementCard,
    aiCalls: [aiCall],
  };
}

function truncate(text, max) {
  const value = String(text);
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}
