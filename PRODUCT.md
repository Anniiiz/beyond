# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (this prototype):** hackathon judges for the City of Espoo recruitment & matchmaking challenge, seeing the prototype presented live and trying it themselves (1440×900 and phone). Judging: Impact & Relevance 45%, Innovation & UX 35%, Responsible & Feasible 20%.
- **Represented:** employers at Espoo matchmaking events; career changers and international talent (fictional: Kimi Muusi, Priya Nair, Jonas Lehto, Amira Haddad, Tomás Rivera).
- Secondary: judges clicking through it themselves afterwards on a laptop or phone.

## Product Purpose

Before matchmaking, people pick an Espoo event (four events based on real past Espoo events: TalentMatch Espoo, Employer Speed Dating with Fail-Safe IT Solutions, Finland TalentMatch x Tech and IT, Employer Meetup: Earthworks; each links to the original event page, with dates moved into the future for the demo) and answer that event's own questions, pick the path(s) they apply through (referral, previous experience, degree, or an event assignment such as a short video), add links and files, plus where they live and their route so far (which they can fill from pasted LinkedIn profile text, extracted by Gemini). The Espoo team opens each application in turn and accepts or declines it, helped by a live Gemini background check that reads the application, attached files and public links and reports what it could and could not verify. Beyond's matchmaking flow for Espoo events: (1) a company refines its job posting by answering five guided questions (impact after six months, the real work, abilities, what can be learned after joining and how it is supported, only genuinely needed requirements with a reason for each, such as a driving licence or hygiene passport, and the short pre-task applicants will answer), producing an Opportunity Card the company approves; (2) a candidate browses and filters open jobs, then applies with a short motivation and a ~10-minute pre-task instead of a CV screen; (3) the company reads every answer, with a background summary of each applicant (the newest generated live by Gemini), and chooses whom to invite; (4) during 8-minute chats with invited people, the company rates three observable behaviours on 1–4 scales (or 'not observed') and adds optional notes; ratings are never summed. Success: the flow is understood at a glance and feels fair to people with non-traditional backgrounds.

## Positioning

AI is used only to help employers define what they actually need — never to score, rank, filter or reject people. The meaningful encounter (an 8-minute problem conversation) replaces CV screening and small talk at events.

## Operating Context

- Header: two separate lines. Event entry (Join the event → Espoo review), which is not part of matchmaking, then matchmaking (Refine the job → Apply → Choose → Meet). Each step has a deep link (#programme, #admit, #refine, #apply, #choose, #meet) and works on its own.
- One fictional company (Northstar Software), one role whose pre-task the company sets in step 1, five fictional applicants including the candidate who just applied.
- Every step has a "Fill automatically" demo button.
- Decided by the user: not a slideshow, no presenter panel, very minimal, little text.

## Capabilities and Constraints

- React 19 + TypeScript + Vite + Tailwind v4, Motion, Lucide. No backend or auth. Live AI runs through Vite dev-server endpoints that call Gemini (gemini-flash-latest) with the key from .env.local: /api/linkedin (route from pasted profile text), /api/check (Espoo review background check over the application, files and public links) and /api/summary (Choose summaries). The key never reaches the browser, and rule-based fallbacks keep the demo working offline.
- AI summaries state only what the applicant wrote: no scores, rankings, recommendations or inferences about personal characteristics.
- Every step must work when entered out of order; no empty screens.
- Out of scope by decision: matching algorithms, compatibility percentages, candidate scoring/ranking, automated rejection, scheduling.
- End-to-end test: `tests/demo_e2e.py` (Playwright) must keep passing.
- In step 3 people choose by reading answers; applicants are listed newest first and never scored or ranked.

## Brand Commitments

- Name **Beyond**; headline "Recruitment for the Future, Not by the Past"; tagline "Your past should inform your future, not limit it."; supporting line "Helping companies discover potential and people discover opportunities in a changing world of work."
- **Loosely Espoo-inspired** (user decision): Espoo blue `#0050BB` stays as the anchor colour. Fonts, secondary colours and shapes may change. The official Espoo/Esbo logo is not used.
- English only.

## Evidence on Hand

The four events' formats, organisers, places and employers are real (from official pages); their dates are moved into the future for the demo. All people, applicants, answers, observations and outcomes are fictional and must stay labelled as such (`src/data/scenarios.ts`, `src/data/catalog.ts`). No real testimonials, customers, metrics or legal-compliance claims exist; do not fabricate any. The prototype must not claim GDPR or EU AI Act compliance.

## Product Principles

1. Humans decide; AI assists reflection and role definition only.
2. Ask for what the job needs, not what the last person had.
3. Minimal: one task per screen, few words, no decoration.
4. Observable, work-relevant behaviour only — no personality, vibe or culture-fit judgements.
5. Clearly label what is simulated or fictional.

## Accessibility & Inclusion

WCAG AA contrast, visible keyboard focus, reduced-motion support, native form semantics; readable from a distance on a projector. Inclusive of non-traditional career paths and international talent.
