import { PATHS, type Answer, type DeepCheck, type EspooEvent, type Prescreen, type Programme } from '../data/demo'

/** Uploaded file contents, kept in memory only for the AI check (never saved or persisted). */
const fileStore = new Map<string, { type: string; data: string }>()

export function rememberFile(name: string, type: string, data: string) {
  fileStore.set(name, { type, data })
}
export function forgetFile(name: string) {
  fileStore.delete(name)
}

export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

/** A demo certificate so "Fill automatically" gives the AI something real to verify. */
export const EXAMPLE_CERTIFICATE = {
  name: 'Customer_Success_Fundamentals_certificate.txt',
  type: 'text/plain',
  text: 'Certificate of completion\nKimi Muusi has completed Customer Success Fundamentals (12 hours).\nIssued March 2025 by Nordic Customer Academy.',
}
export function rememberExampleCertificate() {
  rememberFile(EXAMPLE_CERTIFICATE.name, EXAMPLE_CERTIFICATE.type, btoa(EXAMPLE_CERTIFICATE.text))
  return { name: EXAMPLE_CERTIFICATE.name, size: EXAMPLE_CERTIFICATE.text.length, type: EXAMPLE_CERTIFICATE.type }
}

function answerText(a: Answer | undefined) {
  return Array.isArray(a) ? a.join(', ') : (a ?? '')
}

function pathDetails(pr: Programme, event: EspooEvent): { path: string; details: string }[] {
  return pr.paths.map((id) => {
    const label = PATHS.find((p) => p.id === id)?.label ?? id
    if (id === 'referral') return { path: label, details: [pr.referral.name, pr.referral.relation].filter(Boolean).join(', ') }
    if (id === 'degree') return { path: label, details: [pr.degree.name, pr.degree.school, pr.degree.year].filter(Boolean).join(', ') }
    if (id === 'assignment')
      return {
        path: label,
        details: `Task: ${event.assignment} Answer: ${[pr.assignment.link, pr.assignment.file].filter(Boolean).join(', ') || 'not given'}`,
      }
    return { path: label, details: 'See past roles and learning' }
  })
}

export function checkRequest(pr: Programme, route: Prescreen, event: EspooEvent) {
  const files = [...pr.files.map((f) => f.name), ...(pr.assignment.file ? [pr.assignment.file] : [])]
  const links = [...pr.links, pr.assignment.link].map((l) => l.trim()).filter(Boolean)
  return {
    eventName: event.name,
    answers: event.questions
      .map((q) => ({ question: q.label, answer: answerText(pr.answers[q.id]) }))
      .filter((a) => a.answer.trim()),
    paths: pathDetails(pr, event),
    roles: route.roles.filter((r) => r.title.trim()),
    learning: route.learning.trim(),
    links: [...new Set(links)],
    files: [...new Set(files)].map((name) => {
      const stored = fileStore.get(name)
      return { name, type: stored?.type ?? '', data: stored?.data }
    }),
  }
}

export type CheckRequest = ReturnType<typeof checkRequest>

/** Plain fallback check used whenever the live AI call is unavailable. */
export function fallbackCheck(req: CheckRequest): DeepCheck {
  const roles = req.roles.map((r) => r.title.toLowerCase())
  return {
    summary: roles.length
      ? `Background as ${roles.join(' and ')}${req.learning ? `, plus self-directed learning: ${req.learning.replace(/\.$/, '')}.` : '.'}`
      : 'No background details given.',
    paths: req.paths.map((p) => ({ path: p.path, evidence: p.details || 'No details given.' })),
    verified: [],
    unverified: [
      ...req.links.map((l) => `${l}: not checked (AI check unavailable)`),
      ...req.files.map((f) => `${f.name}: not checked (AI check unavailable)`),
    ],
  }
}

export async function runCheck(req: CheckRequest): Promise<{ data: DeepCheck; source: 'ai' | 'fallback' }> {
  try {
    const r = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(60000),
    })
    const out = (await r.json()) as { check?: DeepCheck }
    if (out.check?.summary) return { data: out.check, source: 'ai' }
  } catch {
    /* fall through */
  }
  return { data: fallbackCheck(req), source: 'fallback' }
}

/** Cache key: same application -> same check (file contents excluded). */
export function checkKey(req: CheckRequest) {
  return JSON.stringify({ ...req, files: req.files.map((f) => [f.name, Boolean(f.data)]) })
}
