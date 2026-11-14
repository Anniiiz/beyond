# Beyond — Design System

Recruitment prototype for the City of Espoo challenge. Two event-entry steps (**Join the event → Espoo review**), then four matchmaking steps (**Refine the job → Apply → Choose → Meet**). Minimal by user decision: one task per screen, few words, no decoration. Visual idea: a career as a transit line (Länsimetro), kept to a single device — the step line in the header.

Source of truth: `src/index.css` (`@theme` tokens) and `src/components/ui/primitives.tsx`.

## Colour

| Token | Value | Use |
|---|---|---|
| `paper` / `surface` | `#FFFFFF` | Page and cards |
| `ink` | `#101820` | Headings, body |
| `ink-2` | `#36404C` | Secondary text |
| `ink-3` | `#545D68` | Hints, meta (≥ 4.5:1 on white and `mist-soft`) |
| `line` | `#DFE5EB` | Hairlines, card borders |
| `line-strong` | `#7D848C` | Input borders (≥ 3:1) |
| `mist-soft` | `#F1F4F7` | The pre-task panel; one quiet surface per screen |
| `sea` | `#0050BB` | Espoo blue: primary actions, accepted suggestions, the line ahead, invited state |
| `sea-deep` / `sea-soft` | `#003A8C` / `#E6EEF9` | Hover; AI tags and avatars |
| `stone` / `stone-deep` / `stone-soft` | `#A7ACB0` / `#545B63` / `#EEF1F4` | The travelled line, struck requirements, "Not now" |
| `metro` | `#FF6319` | Reserved: the "you are here" ring and the "New" badge (new job, new applicant) only |
| `clay` | `#C4262E` | Validation errors only |

One accent (Espoo blue) plus neutrals. Orange never appears as decoration.

## Type

**Schibsted Grotesk Variable**, self-hosted (`@fontsource-variable/schibsted-grotesk`), one family for everything.

- Step headline 42px / 600, tracking −0.02em. Card title 22–24px / 600. Section label 18px / 600.
- Body 16px / 1.55; hints and meta 13–15px. Never below 12px.
- No eyebrows or kickers above headings; no monospace; no tabular figures in running text (they space out punctuation).

## Shape, space, depth

- Radius: buttons and inputs 6–8px, cards 12px, pills full.
- Elevation by 1px `line` borders only; the one emphasised card (the published posting) gets a `sea` border. No shadows except the sticky header's hairline.
- Spacing on a 4px grid; generous separation between sections (40px+), tight within groups.
- Content max width 1200px; Apply is a single 760px column.

## Components

- **Step line** (header): two lines joined by a dashed grey stretch: the event pair (Join the event, Espoo review) and the four matchmaking stations. Below 1280px only the current label shows; on phones, dots only. on a 5px line. Passed = grey ring, current = ink ring with an orange "you are here" ring that glides between steps (`layoutId`), upcoming = blue ring. Clickable; `aria-current="step"`.
- **Button**: `primary` (blue fill), `secondary` (2px blue outline), `ghost` (text). Heights 36 / 44.
- **Guided question** (Refine): numbered blue ring (a real sequence), question as heading, one-line hint, then the answer control. Six questions: impact after six months (three guiding sub-questions, an empty answer box and a "Use example" fill), real work (pick 3–5), abilities (up to 4), learning after joining plus how the company supports it, genuinely needed requirements, each with a short "Why is this necessary?" field, and the pre-task applicants will answer (suggested tasks plus editable title and question).
- **Picker**: suggestion chips that toggle (`aria-pressed`, blue fill when on) plus a dashed "Add …" input for custom entries.
- **Opportunity Card** (Refine preview): live, in six parts: title, the impact you'll make, what you'll work on, what will help you succeed, what you can learn (with support), what you genuinely need (lock icon, with the reason underneath), and the pre-task. Publish stays disabled until question 1 is answered.
- **Job board** (Apply): field filter chips, search, a "No formal requirements" checkbox, and a hairline-divided list (company and place, title, one-line challenge, required qualifications, Apply). The company's own posting is first with the orange "New" badge.
- **Field** (Apply): visible label, "Use example" ghost button, textarea, one-line hint that turns into the error message.
- **Applicant row** (Choose): avatar, name, background and time; two columns "Why this job" and "Pre-task" (clamped to two lines, "Read in full"); Invite / Not now, undoable. Sticky bar with the invited count and "Send invitations".
- **Join the event** (participant): first a list of four events based on real Espoo events (name, date, place, one line, "Event page" source link, Join). Then that event's own questions (multi/single pills or a short text), "How are you applying?" (checkbox cards for Referral, Previous experience, Degree and Event assignment, each revealing its own fields; the assignment shows the event's task with a link or file answer), where you live, "Fill from LinkedIn" (paste profile text, AI extracts roles and learning into the route; "Use example profile" for demos), "Your route so far" as a mini route (grey rings for past roles, blue ring for self-directed learning), and "Links and files" (URL rows and an Attach files button; file contents stay in memory for the AI check only). Send stays disabled until a path, home and some route are given.
- **Espoo review** (Espoo team): a compact list (avatar, name, paths, status: To review / Accepted / Declined) that opens one applicant at a time. The detail view has a large Background check panel (Gemini reads the application, attached files and any public links; shows summary, evidence per path, Verified and Could not verify) beside the Application (paths, links and files, route, event answers). Sticky Decline / Accept moves straight to the next applicant to review; "1 of 4" with previous/next. The list's sticky bar counts accepted people and continues to matchmaking.
- **Background check** (recruiter, on each Choose row): grey-blue panel with a short summary. The newest applicant's summary is generated live by Gemini and labelled "AI summary of their application"; if Gemini is unavailable a rule-based summary is shown without the AI label.
- **Meet** (step 5): invited people in a left list (Rated / Not rated yet), and for the selected person an 8-minute countdown (Start chat, Pause, Reset), their pre-task in one clamped line, three 1–4 segmented scales (Understood the problem, Explained their thinking, Adapted to new information) with end anchors beside the buttons and a "Not observed" option, optional notes, Save. Ratings are never summed or compared.
- **Fill automatically** (demo helper): a ghost button in every step header that fills that step with fictional sample input: the posting, the application, two invites, or sample ratings.
- **Tags**: "Simulated AI" (blue tint) on AI suggestions; "Fictional" (grey tint) on fictional people and companies.

## Motion

One authored moment: the "you are here" ring gliding along the step line. Screens fade in over 240ms (opacity + 6px). Everything respects `prefers-reduced-motion`.

No page footer: the screens end with their own action.

## Browser surfaces

Selection is Espoo blue on white; focus ring 3px `metro` with 2px offset; caret `sea`; scrollbars themed in `stone` on `mist-soft`; link underline offset 0.2em.

## Responsible-AI rules

- AI only suggests requirement rewrites; the company accepts each one and approves publishing.
- Candidates write their own answers ("Use example" exists only for the demo).
- Applicants are listed newest first and are never scored, ranked or filtered automatically; people invite people.
- Fictional and simulated content is always labelled.
