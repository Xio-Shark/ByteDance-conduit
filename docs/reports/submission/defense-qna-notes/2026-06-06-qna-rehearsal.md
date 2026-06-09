# Defense Q&A Rehearsal Notes - 2026-06-06

Scope: local S10 defense rehearsal for the Conduit super individual delivery system.

Timebox: 2026-06-06T13:20:00Z to 2026-06-06T13:38:00Z.

Participants:
- Presenter: xioshark delivery maintainer
- Reviewer: Codex local reviewer

This note records a local Q&A rehearsal against the submitted evidence package. It is not the 3-8 minute public demo video and does not claim that external submission has happened.

## Questions

### Q1 - Architecture

Question: How does the system turn a PM request into a reviewable code change?

Answer summary: The delivery run is staged as clarify, plan, edit, verify, PR, and observe. The API and Web layers are orchestration surfaces; persistent evidence lives under `docs/reports/runs/<run-id>/`. The main architectural proof is `docs/reports/submission/architecture.md`, and run-level evidence demonstrates each stage rather than relying on a narrative-only claim.

Evidence:
- `docs/reports/submission/architecture.md`
- `docs/reports/runs/run-plan-llm-driven/plan.md`
- `docs/reports/runs/run-l3-multi-turn-clarify/ai-calls.jsonl`

### Q2 - U1 Schema-Driven Cross-Stack Change

Question: What proves that cross-stack changes are not hard-coded for one field?

Answer summary: `articleCoverImage.js` declares a schema change and lets the schema driver/frontend generators infer backend and frontend targets. The named run `run-l2-auto-cover-image` contains the plan, diff, verification, and PR draft for the 6-file cross-stack change. The answer emphasizes that the skill is small because the reusable generator carries the common work.

Evidence:
- `services/skills/src/articleCoverImage.js`
- `docs/reports/runs/run-l2-auto-cover-image/plan.md`
- `docs/reports/runs/run-l2-auto-cover-image/verification.json`

### Q3 - U2 Multi-Turn Clarification

Question: How do you prove the system really pauses and resumes clarification rather than using a single scripted prompt?

Answer summary: The `run-l3-multi-turn-clarify` evidence records both clarify and clarify-refine model calls, plus the run route supports answering pending clarification questions. The Web flow exposes pending questions, then the API resumes with PM answers before finalizing requirements. The key proof is the pair of AI call records and the clarification route tests.

Evidence:
- `docs/reports/runs/run-l3-multi-turn-clarify/ai-calls.jsonl`
- `apps/api/src/runClarificationRoutes.js`
- `apps/api/src/runClarificationRoutes.test.js`
- `apps/web/src/components/ClarificationsPanel.jsx`

### Q4 - U3 Plan LLM

Question: Why is the plan stage considered a real AI stage?

Answer summary: `PLAN_MODE=llm` routes planning through `planWithLlm`, records a `stage=plan` AI call, and validates returned target files instead of silently falling back. The run `run-plan-llm-driven` provides non-zero token metrics in `ai-calls.jsonl`, so the observability panel has more than one artificial rules-only record.

Evidence:
- `services/agents/src/planWithLlm.js`
- `docs/reports/runs/run-plan-llm-driven/ai-calls.jsonl`
- `docs/reports/runs/run-plan-llm-driven/plan.md`

### Q5 - U4 Semantic Recall

Question: Why is history recall more than keyword matching?

Answer summary: The index uses local embeddings based on character bigrams and cosine similarity, then merges semantic and token matches. `run-semantic-recall-demo` demonstrates semantic recall being injected into planning evidence even when the user phrasing does not directly name the same skill. This is local and deterministic enough for offline review.

Evidence:
- `services/index/src/embeddingIndex.js`
- `docs/reports/runs/run-semantic-recall-demo/plan.md`
- `docs/reports/runs/run-semantic-recall-demo/verification.json`

### Q6 - U5 Non-List Skill

Question: How do you show that the abstraction is not limited to the article list?

Answer summary: `commentLikeCount` targets the comment domain and changes model/controller/route/UI surfaces in the Conduit sandbox. The named run `run-l2-comment-like` contains a distinct plan and verification trail, proving the skill registry can route to a different feature area without modifying the orchestrator or agent mainline.

Evidence:
- `services/skills/src/commentLikeCount.js`
- `docs/reports/runs/run-l2-comment-like/plan.md`
- `docs/reports/runs/run-l2-comment-like/verification.json`

### Q7 - U6 Live Skill Readiness

Question: What can you do if the reviewer asks for a new small skill during defense?

Answer summary: The U6 package keeps three timed rehearsal cases: comment draft counter, profile account age, and favorite filter toggle. Each one has a named run, skill file, registry entry, implementation change list, and local rehearsal record. The defense position is precise: these are local timed rehearsal proofs, not public demo video substitutes.

Evidence:
- `docs/reports/submission/u6-rehearsal-manifest.json`
- `docs/reports/runs/run-u6-comment-draft-counter/verification.json`
- `docs/reports/runs/run-u6-profile-account-age/verification.json`
- `docs/reports/runs/run-u6-article-favorite-filter-toggle/verification.json`

### Q8 - Submission Boundary

Question: What is still outside the local evidence package?

Answer summary: Local code and materials are not the same as final external submission. Public repo/fresh clone checks are local content checks; Demo URL, public video URL, remote secret scanning state, and platform confirmation must be recorded in `external-submission-evidence.json` after they actually exist. The project intentionally keeps those gates failing until real external facts are available.

Evidence:
- `docs/reports/submission/public-repo-guide.md`
- `docs/reports/submission/security-check-report.md`
- `docs/reports/submission/video-recording-guide.md`
- `docs/reports/submission/external-submission-evidence.template.json`

## Follow-Up Drills

### F1 - What if the LLM returns invalid file paths?

Answer summary: The plan LLM path validates target files and fails fast when the generated plan references impossible paths. This is intentionally not converted into a silent success because fake plans would compromise the delivery evidence.

Evidence:
- `services/agents/src/planWithLlm.js`
- `services/agents/src/planningAgent.test.js`

### F2 - Why not mark the project complete now that the public repo exists?

Answer summary: A fresh clone only proves the public repository content is present and locally clean. Completion also needs the local demo video evidence, uploaded video URL, Demo URL, external submission confirmation, and release-day pre-submission gate. The gate summary is the source of truth and currently must remain blocked when those facts are absent.

Evidence:
- `docs/reports/submission/public-repo-guide.md`
- `docs/reports/submission/next-steps-summary.json`
- `scripts/submission-next-steps.mjs`

## Outcome

Status: passed for local Q&A readiness.

Open issues: none for defense-prep content. External submission and public demo video remain separate blockers.
