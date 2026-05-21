import assert from "node:assert/strict";
import test from "node:test";
import { clarifyWithLlm } from "./clarifyWithLlm.js";

const CARD_JSON = {
  id: "REQ-LLM-READS",
  source_input: "给文章列表加阅读量展示",
  goal: "文章列表卡片展示阅读量",
  scope: {
    include: ["文章列表", "阅读量", "展示字段", "Conduit frontend"],
    exclude: ["后端 schema", "数据库迁移"],
  },
  assumptions: ["P0 使用前端假数据"],
  clarifications: ["阅读量是否仅展示在 ArticlePreview 卡片？"],
  acceptance: ["列表卡片显示 eye icon 和 reads"],
  level: "L1",
};

test("clarifyWithLlm returns validated card and non-zero usage", async () => {
  const modelClient = {
    model: "mimo-v2.5-pro",
    async chat() {
      return {
        content: JSON.stringify(CARD_JSON),
        tokensIn: 90,
        tokensOut: 60,
        latencyMs: 150,
        costEstimate: 0.0003,
      };
    },
  };

  const result = await clarifyWithLlm({
    input: "给文章列表加阅读量展示",
    modelClient,
  });

  assert.equal(result.requirementCard.level, "L1");
  assert.equal(result.aiCall.model, "mimo-v2.5-pro");
  assert.ok(result.aiCall.tokens_in > 0);
  assert.ok(result.aiCall.tokens_out > 0);
});
