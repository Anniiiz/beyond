import { createContext, use, useEffect, useState, type ReactNode } from 'react'
import { EMPTY_POSTING, EMPTY_PRESCREEN, EMPTY_PROGRAMME, type Posting, type Prescreen, type Programme } from '../data/demo'
import type { Summary } from '../lib/summary'
import type { DeepCheck } from '../data/demo'

export type Step = 'programme' | 'admit' | 'refine' | 'apply' | 'choose' | 'meet'
/** Two groups: entry to Espoo's programme (not part of matchmaking), then the matchmaking process. */
export const STEPS: { id: Step; label: string; who: string; group: 'programme' | 'match' }[] = [
  { id: 'programme', label: 'Join the event', who: 'Candidate', group: 'programme' },
  { id: 'admit', label: 'Espoo review', who: 'Espoo team', group: 'programme' },
  { id: 'refine', label: 'Refine the job', who: 'Company', group: 'match' },
  { id: 'apply', label: 'Apply', who: 'Candidate', group: 'match' },
  { id: 'choose', label: 'Choose', who: 'Company', group: 'match' },
  { id: 'meet', label: 'Meet', who: 'Company', group: 'match' },
]

export type Decision = 'invite' | 'pass'

export interface Evaluation {
  ratings: Record<string, number | 'na'>
  notes: string
  done: boolean
}

export interface AppState {
  step: Step
  posting: Posting
  published: boolean
  motivation: string
  pretask: string
  jobId: string | null
  prescreen: Prescreen
  summary: Summary | null
  programme: Programme
  programmeSummary: Summary | null
  deepCheck: { key: string; data: DeepCheck; source: 'ai' | 'fallback' } | null
  admissions: Record<string, Decision>
  submitted: boolean
  decisions: Record<string, Decision>
  evaluations: Record<string, Evaluation>
}

const INITIAL: AppState = {
  step: 'programme',
  posting: EMPTY_POSTING,
  published: false,
  motivation: '',
  pretask: '',
  jobId: null,
  prescreen: EMPTY_PRESCREEN,
  summary: null,
  programme: EMPTY_PROGRAMME,
  programmeSummary: null,
  deepCheck: null,
  admissions: {},
  submitted: false,
  decisions: {},
  evaluations: {},
}

const KEY = 'beyond-6step-v1'

function stepFromHash(): Step | null {
  const h = window.location.hash.slice(1)
  return STEPS.some((s) => s.id === h) ? (h as Step) : null
}

function load(): AppState {
  let state = INITIAL
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) state = { ...INITIAL, ...(JSON.parse(raw) as AppState) }
  } catch {
    /* ignore */
  }
  const fromHash = stepFromHash()
  return fromHash ? { ...state, step: fromHash } : state
}

interface Ctx {
  state: AppState
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
  go: (step: Step) => void
  reset: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  const update: Ctx['update'] = (patch) =>
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  const go = (step: Step) => setState((s) => ({ ...s, step }))
  const reset = () => setState({ ...INITIAL })

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  // Step lives in the URL hash: deep links and browser back/forward.
  useEffect(() => {
    if (window.location.hash !== `#${state.step}`) window.history.pushState(null, '', `#${state.step}`)
    window.scrollTo({ top: 0 })
  }, [state.step])
  useEffect(() => {
    const onPop = () => {
      const s = stepFromHash()
      if (s) setState((st) => ({ ...st, step: s }))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return <AppCtx value={{ state, update, go, reset }}>{children}</AppCtx>
}

export function useApp() {
  const c = use(AppCtx)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
