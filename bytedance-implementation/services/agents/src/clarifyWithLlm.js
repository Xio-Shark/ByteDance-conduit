import { parseRequirementCardFromLlm } from "./requirementCard.js";

export const CLARIFY_PROMPT_VERSION = "1.0.0-llm";

const SYSTEM_PROMPT = `You are the Requirement Agent for the Conduit super-individual delivery system.
Return ONLY one JSON object (no markdown prose) with this exact shape:
{
  "id": "REQ-...",
  "source_input": "<PM input>",
  "goal": "<one sentence goal>",
  "scope": { "include": ["..."], "exclude": ["..."] },
  "assumptions": ["..."],
  "clarifications": ["..."],
  "acceptance": ["..."],
  "level": "L1" | "L2" | "L3"
}

Rules:
- Never invent backend/API/database changes for L1 list-display tasks unless PM explicitly asks.
- If PM input is vague or missing boundaries, clarifications MUST be open questions for PM to answer (not silent decisions).
- If PM clearly asks for article list read count on Conduit frontend with fake data, level L1, exclude backend schema.
- scope.include / scope.exclude / assumptions / clarifications / acceptance must each have at least one non-empty string.
- source_input must echo the PM input.`;

export async function clarifyWithLlm({ input, modelClient }) {
  if (!modelClient?.chat) {
    throw new Error("modelClient is required for LLM clarify");
  }

  const trimmed = input.trim();
  const response = await modelClient.chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmed },
    ],
  });

  const requirementCard = parseRequirementCardFromLlm(response.content);
  const tokensIn = response.tokensIn;
  const tokensOut = response.tokensOut;

  if (tokensIn + tokensOut <= 0) {
    throw new Error("LLM clarify must report non-zero token usage");
  }

  return {
    requirementCard,
    aiCall: {
      stage: "clarify",
      model: modelClient.model,
      prompt_version: CLARIFY_PROMPT_VERSION,
      input_summary: truncate(trimmed, 240),
      output_summary: truncate(
        `${requirementCard.goal}; clarifications: ${requirementCard.clarifications.join(" | ")}`,
        240,
      ),
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      latency_ms: response.latencyMs,
      cost_estimate: response.costEstimate,
      status: "completed",
    },
  };
}

function truncate(text, max) {
  const value = String(text);
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}
