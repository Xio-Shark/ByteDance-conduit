import assert from "node:assert/strict";
import test from "node:test";
import { checkCrossStackSync } from "./crossStackSync.js";

test("checkCrossStackSync passes when draft appears on both sides", () => {
  const result = checkCrossStackSync({
    skill: { id: "article-draft-indicator" },
    sandboxFiles: [
      {
        path: "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
        content: `<h1>{article.title}{article.draft ? <span className="draft-badge">Draft</span> : null}</h1>`,
      },
      { path: "backend/models/Article.js", content: "draft: DataTypes.BOOLEAN" },
      { path: "backend/controllers/articles.js", content: "draft: false" },
    ],
  });

  assert.equal(result.status, "passed");
});

test("checkCrossStackSync fails when backend draft is missing", () => {
  const result = checkCrossStackSync({
    skill: { id: "article-draft-indicator" },
    sandboxFiles: [
      {
        path: "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx",
        content: `<span className="draft-badge">{article.draft}</span>`,
      },
      { path: "backend/models/Article.js", content: "draft: DataTypes.BOOLEAN" },
      { path: "backend/controllers/articles.js", content: "no article flag" },
    ],
  });

  assert.equal(result.status, "failed");
});

test("checkCrossStackSync rejects generic draft mentions without implementation anchors", () => {
  const result = checkCrossStackSync({
    skill: { id: "article-draft-indicator" },
    sandboxFiles: [
      { path: "frontend/src/components/ArticlesPreview/ArticlesPreview.jsx", content: "draft comment only" },
      { path: "backend/models/Article.js", content: "draft comment only" },
      { path: "backend/controllers/articles.js", content: "draft comment only" },
    ],
  });

  assert.equal(result.status, "failed");
});

test("checkCrossStackSync fails when no checker exists for the Skill", () => {
  const result = checkCrossStackSync({
    skill: { id: "article-list-display-field" },
    sandboxFiles: [],
  });

  assert.equal(result.status, "failed");
  assert.equal(result.message, "No cross-stack checker for skill article-list-display-field");
});
