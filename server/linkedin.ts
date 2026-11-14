import type { Plugin } from 'vite'

/**
 * Dev-server endpoint: POST /api/linkedin { text }
 * Extracts a career route (roles with years, self-directed learning) from LinkedIn profile text the
 * person pasted themselves (e.g. LinkedIn's "Save to PDF" export). Nothing is stored.
 * Always answers 200 JSON: { roles, learning } on success, { error } otherwise.
 */

const MODEL = 'gemini-flash-latest'

function prompt(text: string) {
  return [
    "Extract a person's career route from LinkedIn profile text they pasted themselves.",
    '',
    'Return JSON with:',
    '- "roles": up to 5 past or current jobs, oldest first, each { "title": job title only, "years": e.g. "2021–2023" or "2023–now" }',
    '- "learning": one short sentence listing courses, certifications, projects or skills they learned on their own, or "" if none',
    '',
    'Use only what the text says. Do not infer anything about personality, age, gender, nationality or health.',
    '',
    'Profile text:',
    '"""',
    text.slice(0, 6000),
    '"""',
  ].join('\n')
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    roles: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { title: { type: 'STRING' }, years: { type: 'STRING' } },
        required: ['title', 'years'],
      },
    },
    learning: { type: 'STRING' },
  },
  required: ['roles', 'learning'],
}

export function linkedinApi(apiKey: string | undefined): Plugin {
  return {
    name: 'beyond-linkedin-api',
    configureServer(server) {
      server.middlewares.use('/api/linkedin', async (req, res) => {
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
        let text = ''
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          text = ((JSON.parse(raw) as { text?: string }).text ?? '').trim()
        } catch {
          return send({ error: 'Bad request' })
        }
        if (!text) return send({ error: 'No profile text' })

        let lastError = 'Import failed'
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt(text) }] }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 1024,
                  thinkingConfig: { thinkingBudget: 0 },
                  responseMimeType: 'application/json',
                  responseSchema: SCHEMA,
                },
              }),
              signal: AbortSignal.timeout(15000),
            })
            const data = (await r.json()) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[]
              error?: { message?: string }
            }
            const out = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
            if (!r.ok || !out) throw new Error(data.error?.message ?? 'No response')
            const parsed = JSON.parse(out) as { roles?: { title: string; years: string }[]; learning?: string }
            return send({ roles: (parsed.roles ?? []).slice(0, 5), learning: parsed.learning ?? '' })
          } catch (e) {
            lastError = e instanceof Error ? e.message : lastError
          }
        }
        server.config.logger.warn(`[linkedin] Gemini unavailable: ${lastError}`)
        send({ error: lastError })
      })
    },
  }
}
