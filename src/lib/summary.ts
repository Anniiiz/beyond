import type { Answer, EspooEvent, Prescreen, ReqStatus } from '../data/demo'

export interface SummaryInput {
  context?: 'programme'
  fields?: string[]
  hope?: string
  jobTitle: string
  requirements: { name: string; status: ReqStatus; how?: string }[]
  roles: { title: string; years: string }[]
  learning: string
}

export interface Summary {
  key: string
  text: string
  source: 'ai' | 'fallback'
}

export function summaryInput(jobTitle: string, requirements: string[], p: Prescreen): SummaryInput {
  return {
    jobTitle,
    requirements: requirements.map((name) => ({
      name,
      status: p.answers[name]?.status ?? 'have',
      how: p.answers[name]?.how || undefined,
    })),
    roles: p.roles.filter((r) => r.title.trim()),
    learning: p.learning.trim(),
  }
}

export function programmeInput(p: Prescreen, fields: string[], hope: string): SummaryInput {
  return {
    context: 'programme',
    jobTitle: 'Espoo event',
    fields,
    hope: hope.trim(),
    requirements: [],
    roles: p.roles.filter((r) => r.title.trim()),
    learning: p.learning.trim(),
  }
}

/** Event application -> summary input: choice answers become fields, text answers become the hope. */
export function eventInput(p: Prescreen, event: EspooEvent, answers: Record<string, Answer>): SummaryInput {
  const fields: string[] = []
  const texts: string[] = []
  for (const q of event.questions) {
    const a = answers[q.id]
    if (q.kind === 'text') {
      if (typeof a === 'string' && a.trim()) texts.push(a.trim())
    } else if (Array.isArray(a)) fields.push(...a)
    else if (typeof a === 'string' && a) fields.push(a)
  }
  return { ...programmeInput(p, fields, texts.join(' ')), jobTitle: event.name }
}

export function summaryKey(input: SummaryInput) {
  return JSON.stringify(input)
}

/** Plain, rule-based summary used whenever the live AI call is unavailable. */
export function fallbackSummary(input: SummaryInput): string {
  const roles = input.roles.map((r) => r.title.toLowerCase())
  const parts: string[] = []
  parts.push(
    roles.length
      ? `Background as ${roles.join(' and ')}${input.learning ? `, plus self-directed learning: ${input.learning.replace(/\.$/, '')}.` : '.'}`
      : input.learning
        ? `Self-directed learning: ${input.learning}`
        : 'No background details given.',
  )
  if (input.context === 'programme') {
    if (input.fields?.length) parts.push(`Looking for work in ${input.fields.join(', ').toLowerCase()}.`)
    return parts.join(' ')
  }
  const other = input.requirements.filter((r) => r.status === 'other')
  const notYet = input.requirements.filter((r) => r.status === 'not-yet')
  if (input.requirements.length && !other.length && !notYet.length) parts.push('Has all listed requirements.')
  if (other.length) parts.push(other.map((r) => `Meets ${r.name} another way: ${r.how ?? 'details not given'}`).join(' '))
  if (notYet.length) parts.push(`Not yet: ${notYet.map((r) => r.name).join(', ')}.`)
  return parts.join(' ')
}

/** Live Gemini summary through the dev server; falls back to the rule-based summary on any failure. */
export async function getSummary(input: SummaryInput): Promise<Summary> {
  const key = summaryKey(input)
  try {
    const r = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(25000),
    })
    const data = (await r.json()) as { summary?: string }
    if (r.ok && data.summary) return { key, text: data.summary, source: 'ai' }
  } catch {
    /* fall through to fallback */
  }
  return { key, text: fallbackSummary(input), source: 'fallback' }
}
