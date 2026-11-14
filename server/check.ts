import type { Plugin } from 'vite'

/**
 * Dev-server endpoint: POST /api/check
 * A detailed background check for the Espoo team: Gemini reads the application, any attached files
 * (PDF, images, text, sent inline) and any public links it can open (url_context tool).
 * Files are never stored. Always answers 200 JSON: { check } on success, { error } otherwise.
 */

const MODEL = 'gemini-flash-latest'
const MAX_INLINE_BYTES = 8 * 1024 * 1024
const INLINE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain']

interface CheckRequest {
  eventName: string
  answers: { question: string; answer: string }[]
  paths: { path: string; details: string }[]
  roles: { title: string; years: string }[]
  learning: string
  links: string[]
  files: { name: string; type: string; data?: string }[]
}

function prompt(r: CheckRequest) {
  const roles = r.roles.map((x) => `- ${x.title}${x.years ? ` (${x.years})` : ''}`).join('\n') || '- none given'
  const paths = r.paths.map((p) => `- ${p.path}: ${p.details || 'no details'}`).join('\n') || '- none chosen'
  const answers = r.answers.map((a) => `- ${a.question}: ${a.answer}`).join('\n') || '- none'
  const links = r.links.length ? r.links.map((l) => `- ${l}`).join('\n') : '- none'
  const files = r.files.length
    ? r.files.map((f) => `- ${f.name}${f.data ? ' (attached below)' : ' (not readable here: name only)'}`).join('\n')
    : '- none'
  return [
    `You prepare a background check for the City of Espoo team deciding who joins the event "${r.eventName}".`,
    'The event looks for potential, not past job titles. The applicant chose one or more paths to show they fit.',
    '',
    'Paths chosen and details:',
    paths,
    'Past roles:',
    roles,
    `Learning on their own: ${r.learning || 'none given'}`,
    'Answers to the event questions:',
    answers,
    'Links they provided (open the ones you can):',
    links,
    'Files they provided:',
    files,
    '',
    'Reply with only a JSON object, no markdown, in this shape:',
    '{"summary": string, "paths": [{"path": string, "evidence": string}], "verified": [string], "unverified": [string]}',
    '- summary: 2–3 plain sentences on their background and how it connects to the event.',
    '- paths: one entry per chosen path, saying what evidence supports it (from the application, files or links).',
    '- verified: specific facts you confirmed in an attached file or an opened link, naming the source.',
    '- unverified: claims or links you could not check, and why (for example a page needing a login).',
    'Rules: state only what the material shows; no scores, rankings, recommendations or admission advice;',
    'no guesses about personality, age, gender, nationality, health or any protected characteristic.',
  ].join('\n')
}

function parseJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  return JSON.parse(cleaned.slice(start, end + 1)) as {
    summary?: string
    paths?: { path: string; evidence: string }[]
    verified?: string[]
    unverified?: string[]
  }
}

export function checkApi(apiKey: string | undefined): Plugin {
  return {
    name: 'beyond-check-api',
    configureServer(server) {
      server.middlewares.use('/api/check', async (req, res) => {
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
        let body: CheckRequest
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          body = JSON.parse(raw) as CheckRequest
        } catch {
          return send({ error: 'Bad request' })
        }

        // Attach readable files inline, within a size budget.
        let budget = MAX_INLINE_BYTES
        const fileParts: { inline_data: { mime_type: string; data: string } }[] = []
        for (const f of body.files ?? []) {
          if (!f.data || !INLINE_TYPES.includes(f.type)) continue
          const bytes = Math.floor((f.data.length * 3) / 4)
          if (bytes > budget) {
            f.data = undefined
            continue
          }
          budget -= bytes
          fileParts.push({ inline_data: { mime_type: f.type, data: f.data } })
        }
        const links = (body.links ?? []).filter((l) => /^https?:\/\//i.test(l)).slice(0, 10)

        let lastError = 'Check failed'
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt({ ...body, links }) }, ...fileParts] }],
                ...(links.length ? { tools: [{ url_context: {} }] } : {}),
                generationConfig: { temperature: 0.2, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } },
              }),
              signal: AbortSignal.timeout(40000),
            })
            const data = (await r.json()) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[]
              error?: { message?: string }
            }
            const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
            if (!r.ok || !text) throw new Error(data.error?.message ?? 'No response')
            const parsed = parseJson(text)
            return send({
              check: {
                summary: parsed.summary ?? '',
                paths: parsed.paths ?? [],
                verified: parsed.verified ?? [],
                unverified: parsed.unverified ?? [],
              },
            })
          } catch (e) {
            lastError = e instanceof Error ? e.message : lastError
          }
        }
        server.config.logger.warn(`[check] Gemini unavailable: ${lastError}`)
        send({ error: lastError })
      })
    },
  }
}
