export function parseAiCallLog(text) {
  if (typeof text !== "string") {
    throw new Error("ai-calls.jsonl content must be a string");
  }
  return text
    .split("\n")
    .filter(Boolean)
    .map((line, index) => parseAiCallLine(line, index));
}

export function summarizeAiCalls(calls) {
  return calls.reduce(
    (summary, call) => ({
      stages: summary.stages + 1,
      tokensIn: summary.tokensIn + requireFiniteNumber(call.tokens_in, "tokens_in"),
      tokensOut: summary.tokensOut + requireFiniteNumber(call.tokens_out, "tokens_out"),
      latencyMs: summary.latencyMs + requireFiniteNumber(call.latency_ms, "latency_ms"),
      costEstimate: summary.costEstimate + requireFiniteNumber(call.cost_estimate, "cost_estimate"),
    }),
    {
      stages: 0,
      tokensIn: 0,
      tokensOut: 0,
      latencyMs: 0,
      costEstimate: 0,
    },
  );
}

export function serializeAiCallLog(calls) {
  return calls.map((call) => JSON.stringify(call)).join("\n").concat("\n");
}

function parseAiCallLine(line, index) {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`Invalid ai-calls.jsonl line ${index + 1}: ${error.message}`);
  }
}

export function requireFiniteNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`AI call ${name} must be a finite number`);
  }
  return number;
}
