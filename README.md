# Beyond — Recruitment for the Future, Not by the Past

Interactive hackathon prototype for the City of Espoo recruitment & matchmaking challenge.
The events are based on real past Espoo events (dates moved into the future); all people, applicants and outcomes are fictional. Gemini powers LinkedIn import and the background checks, each with an offline fallback; everything else runs without a backend.

## Gemini (optional)

Gemini runs live through the dev server for: LinkedIn import (roles from pasted profile text), the Espoo review background check (reads the application, attached files and public links) and the Choose step summaries. Uploaded files are sent to Gemini for the check only and are never stored. Put your key in `.env.local` (git-ignored, never sent to the browser):

```bash
echo "GEMINI_API_KEY=your-key" > .env.local
```

Without a key, or offline, summaries fall back to rule-based text and LinkedIn import asks people to fill the route by hand.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview   # production build
```

## Presenting

Event entry: Join the event → Espoo review. Then matchmaking: Refine the job → Apply → Choose → Meet.

- Every step has a **Fill automatically** button for a quick run-through.
- Deep links: `#programme`, `#admit`, `#refine`, `#apply`, `#choose`, `#meet`.
- State survives reloads within the tab; **Start over** (header) resets it.
- The Gemini summary only runs under `npm run dev`; `npm run preview` uses the fallback.

## End-to-end test

With `npm run dev` running:

```bash
python3 -m venv .venv && .venv/bin/pip install playwright && .venv/bin/python -m playwright install chromium
.venv/bin/python tests/demo_e2e.py test-screenshots
```

Walks the whole flow (join the event, Espoo review, refine, apply, choose, meet) and every Fill automatically button at 1440×900 and 375×812, and fails on console errors or horizontal overflow.
