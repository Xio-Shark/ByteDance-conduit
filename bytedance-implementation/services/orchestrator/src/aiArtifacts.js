import { buildRequirement } from "../../agents/src/requirementAgent.js";
import { clarifyWithLlm } from "../../agents/src/clarifyWithLlm.js";
import { createLlmClient } from "./llmClient.js";

const RULES_MODE = "rules";
const LLM_MODE = "llm";

export async function buildAiArtifacts({ env = process.env, input, modelClient }) {
  const mode = String(env.AI_MODE || RULES_MODE).trim().toLowerCase();

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

function buildRulesArtifacts(input) {
  return {
    mode: RULES_MODE,
    requirementCard: buildRequirement(input),
    aiCalls: [
      {
        stage: "clarify",
        model: "rules-first-p0",
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
