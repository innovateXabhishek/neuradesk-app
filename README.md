# NEURADESK

Internal employee operations hub + agentic AI copilot, built for Brainwave Science.
The copilot answers questions, logs tasks, files leave, and drafts messages — and
performs those actions inside the app via a lightweight function-calling pattern.

## Architecture

    Browser (public/index.html)  ──POST /api/chat──▶  Node server (server.js)  ──▶  Anthropic API
                                                       (holds API key, never the browser)

The API key lives only on the server. The client never sees it — the
correct, reviewable pattern for production.


Requires **Node.js 18+** (for built-in fetch). Check with: `node -v`

1. Set your Anthropic API key:

2. Start the server (no `npm install` needed — zero dependencies):

       node server.js

3. Open  http://localhost:3000

That's it. Type in the NEURA Copilot tab and it will respond live.

## Try these in the copilot
- "How many leave days do I have left?"
- "Log a task: calibrate P300 stimuli set"
- "Request 2 days annual leave"
- "Draft a message to Santosh about the NEURADESK rollout"

## Cost control
Switch models without code changes:

       NEURA_MODEL=claude-3-5-haiku-latest node server.js

## Notes
- State is in-memory (resets on refresh) — by design, for a prototype.
  Production: swap the `S` object in index.html for real API calls to your
  backend, and persist to Postgres.
