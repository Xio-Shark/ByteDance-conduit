# Local Demo Browser Check - 2026-06-06

Scope: local UI smoke check for submission readiness. This does not provide a public online Demo URL and does not replace the 3-8 minute public video.

## Environment

- Web URL: `http://localhost:5173/`
- API port observed: `3001`
- Web dev server: `npm run dev -w apps/web`
- Browser automation: GenericAgent `TMWebDriver` from `/Users/xioshark/Downloads/GenericAgent-main`
- Screenshot artifact: `output/playwright/local-demo.png`

## GenericAgent Readback

GenericAgent connected to the user browser tab at `http://localhost:5173/`.

Observed page facts:

- Title: `Conduit Super Individual`
- Main heading: `PM 到 PR 的端到端交付控制台`
- Primary action: `Start run`
- Cross-run AI usage panel: visible
- Aggregated passed archived runs: `29`
- Skipped incomplete or failed runs: `194`
- Tokens in: `3131`
- Tokens out: `8952`
- Non-zero LLM run examples visible:
  - `run-plan-llm-driven`
  - `run-l3-multi-turn-clarify`
  - `run-semantic-recall-demo`

## Outcome

Status: passed for local browser smoke check.

Remaining external gap: a public Demo URL must still be deployed or otherwise provided through the competition submission system and recorded in `external-submission-evidence.json` after it exists.
