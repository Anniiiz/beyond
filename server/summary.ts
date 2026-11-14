import type { Plugin } from 'vite'

/**
 * Dev-server endpoint: POST /api/summary
 * Turns a participant's prescreen answers into a short, factual background summary with Gemini.
 * The API key is read from .env.local on the server and never reaches the browser.
 * The client falls back to a pre-written summary if this fails, so the demo never breaks.
 */

const MODEL = 'gemini-flash-latest'

interface SummaryRequest {
  /** 'programme' = Espoo team reviewing entry to the programme; default = recruiter reviewing a job prescreen. */
  context?: 'programme'
  fields?: string[]
  hope?: string
  jobTitle: string
  requirements: { name: string; status: 'have' | 'other' | 'not-yet'; how?: string }[]
  roles: { title: string; years: string }[]
  learning: string
}

const RULES = `Rules: state only what the applicant wrote; no scores, rankings, recommendations or admission or hiring advice; no guesses about personality, age, gender, nationality, health or any protected characteristic; no headings or bullet points.`

function buildProgrammePrompt(r: SummaryRequest) {
  const roles = r.roles.map((x) => `- ${x.title}${x.years ? ` (${x.years})` : ''}`).join('\n') || '- None given'
  return `You write short summaries for the City of Espoo team that reviews applications to an event connecting professionals with companies. The event looks for potential, not past job titles.

Past roles:
${roles}
Learning on their own: ${r.learning || 'none given'}
Fields they are looking for: ${r.fields?.join(', ') || 'not given'}
What they hope to get from the event: ${r.hope || 'not given'}

Write 2 plain sentences, under 55 words, in English, describing how their past roles and self-directed learning connect to the fields they named.
${RULES}`
}

function buildPrompt(r: SummaryRequest) {
  if (r.context === 'programme') return buildProgrammePrompt(r)
  const reqs = r.requirements.length
    ? r.requirements
        .map((q) => `- ${q.name}: ${q.status === 'have' ? 'has it' : q.status === 'other' ? `can show it another way: ${q.how || '(no detail)'}` : 'not yet'}`)
        .join('\n')
    : '- Not covered in this application'
  const roles = r.roles.map((x) => `- ${x.title}${x.years ? ` (${x.years})` : ''}`).join('\n') || '- None given'
  return `You write short background summaries for a recruiter who hires for potential, not past job titles.

Role applied for: ${r.jobTitle}
Genuinely needed requirements and the applicant's own answers:
${reqs}
Past roles:
${roles}
Learning on their own: ${r.learning || 'none given'}

Write 2–3 plain sentences, under 70 words, in English:
1. How the applicant's past roles and self-directed learning connect to this work.
2. If requirements are listed, how they meet each one, naming any met through another route and any marked "not yet" neutrally; if none are listed, do not mention requirements.
${RULES}`
}

export function summaryApi(apiKey: string | undefined): Plugin {
  return {
    name: 'beyond-summary-api',
    configureServer(server) {
      server.middlewares.use('/api/summary', async (req, res) => {
        // Always answer 200 with JSON: { summary } on success, { error } otherwise.
        // The client then shows its rule-based fallback without a browser console error.
        const send = (payload: object) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        if (!apiKey) return send({ error: 'GEMINI_API_KEY missing' })
        let body: SummaryRequest
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          body = JSON.parse(raw) as SummaryRequest
        } catch {
          return send({ error: 'Bad request' })
        }
        let lastError = 'No summary returned'
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: buildPrompt(body) }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
              }),
              signal: AbortSignal.timeout(12000),
            })
            const data = (await r.json()) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[]
              error?: { message?: string }
            }
            const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
            if (r.ok && text) return send({ summary: text, model: MODEL })
            lastError = data.error?.message ?? lastError
          } catch (e) {
            lastError = e instanceof Error ? e.message : 'Summary failed'
          }
        }
        server.config.logger.warn(`[summary] Gemini unavailable, client will use fallback: ${lastError}`)
        send({ error: lastError })
      })
    },
  }
}
