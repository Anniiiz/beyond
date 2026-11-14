import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDashed,
  CircleCheck,
  FileText,
  Link2,
  Sparkles,
  X,
} from 'lucide-react'
import {
  DEFAULT_EVENT_ID,
  EMPTY_PROGRAMME,
  EVENTS,
  EXAMPLE_EVIDENCE,
  EXAMPLE_PRESCREEN,
  PATHS,
  PROGRAMME_APPLICANTS,
  SAMPLE_ADMITS,
  YOU,
  type DeepCheck,
  type PathId,
} from '../data/demo'
import { useApp, type Decision } from '../state/app'
import { checkKey, checkRequest, rememberExampleCertificate, runCheck } from '../lib/check'
import { Avatar, Button, FillButton, StepHeader, cx } from './ui/primitives'

interface Applicant {
  id: string
  name: string
  initials: string
  home: string
  fields: string[]
  paths: PathId[]
  evidence: string[]
  answers: { question: string; answer: string }[]
  route: string[]
  check: { data: DeepCheck; source: 'ai' | 'fallback' | 'written' } | null
  isNew?: boolean
}

const pathLabel = (id: PathId) => PATHS.find((p) => p.id === id)?.label ?? id

function StatusPill({ d }: { d?: Decision }) {
  if (!d) return <span className="text-[13.5px] text-ink-3">To review</span>
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[13px] font-semibold',
        d === 'invite' ? 'bg-sea text-white' : 'bg-stone-soft text-stone-deep',
      )}
    >
      {d === 'invite' ? <Check aria-hidden size={13} /> : <X aria-hidden size={13} />}
      {d === 'invite' ? 'Accepted' : 'Declined'}
    </span>
  )
}

function CheckPanel({ a }: { a: Applicant }) {
  const c = a.check
  return (
    <section aria-labelledby="check-title" className="rounded-[12px] bg-mist-soft p-5 sm:p-6">
      <h2 id="check-title" className="flex flex-wrap items-center gap-2 text-[18px] font-semibold text-ink">
        Background check
        {c?.source === 'ai' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sea-soft px-2 py-0.5 text-[12px] font-medium text-sea-deep">
            <Sparkles aria-hidden size={11} /> By AI, from their application, files and links
          </span>
        ) : null}
      </h2>
      {!c ? (
        <p className="mt-3 text-[15px] text-ink-3" role="status">
          Reading the application, files and links…
        </p>
      ) : (
        <div className="mt-3 space-y-5">
          <p className="text-[16px] leading-relaxed text-ink">{c.data.summary}</p>
          {c.data.paths.length ? (
            <div>
              <h3 className="text-[13px] font-semibold text-ink-3">Paths and evidence</h3>
              <ul className="mt-2 space-y-2">
                {c.data.paths.map((p) => (
                  <li key={p.path} className="text-[15px]">
                    <span className="font-semibold text-ink">{p.path}. </span>
                    <span className="text-ink-2">{p.evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {c.data.verified.length ? (
            <div>
              <h3 className="text-[13px] font-semibold text-ink-3">Verified</h3>
              <ul className="mt-2 space-y-1.5">
                {c.data.verified.map((v) => (
                  <li key={v} className="flex gap-2 text-[15px] text-ink">
                    <CircleCheck aria-hidden size={16} className="mt-0.5 shrink-0 text-sea" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {c.data.unverified.length ? (
            <div>
              <h3 className="text-[13px] font-semibold text-ink-3">Could not verify</h3>
              <ul className="mt-2 space-y-1.5">
                {c.data.unverified.map((v) => (
                  <li key={v} className="flex gap-2 text-[15px] text-ink-2">
                    <CircleDashed aria-hidden size={16} className="mt-0.5 shrink-0 text-ink-3" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function Detail({
  a,
  index,
  total,
  decision,
  onBack,
  onDecide,
  onPrev,
  onNext,
}: {
  a: Applicant
  index: number
  total: number
  decision?: Decision
  onBack: () => void
  onDecide: (d: Decision) => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded text-[15px] font-medium text-sea hover:underline">
          <ArrowLeft aria-hidden size={16} /> All applications
        </button>
        <div className="flex items-center gap-1 text-[14px] text-ink-3">
          <Button variant="ghost" size="sm" onClick={onPrev} aria-label="Previous applicant" disabled={index === 0}>
            <ArrowLeft aria-hidden size={15} />
          </Button>
          {index + 1} of {total}
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Next applicant" disabled={index === total - 1}>
            <ArrowRight aria-hidden size={15} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Avatar initials={a.initials} size={56} />
        <div className="min-w-0 flex-1">
          <h2 className="display flex flex-wrap items-center gap-2 text-[30px] leading-tight font-semibold text-ink">
            {a.name}
            {a.isNew ? <span className="rounded-full bg-metro px-2 py-0.5 text-[12px] font-bold text-ink">New</span> : null}
          </h2>
          <p className="text-[15px] text-ink-3">
            {a.home}
            {a.fields.length ? `, looking for ${a.fields.join(', ').toLowerCase()}` : ''}
          </p>
        </div>
        <StatusPill d={decision} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <CheckPanel a={a} />

        <aside aria-labelledby="app-title" className="space-y-5">
          <h2 id="app-title" className="text-[18px] font-semibold text-ink">
            Application
          </h2>
          <div>
            <h3 className="text-[13px] font-semibold text-ink-3">Applying through</h3>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {a.paths.map((p) => (
                <li key={p} className="rounded-full border border-sea/40 bg-sea-soft px-2.5 py-0.5 text-[13.5px] font-medium text-sea-deep">
                  {pathLabel(p)}
                </li>
              ))}
            </ul>
          </div>
          {a.evidence.length ? (
            <div>
              <h3 className="text-[13px] font-semibold text-ink-3">Links and files</h3>
              <ul className="mt-1.5 space-y-1">
                {a.evidence.map((e) => (
                  <li key={e} className="flex items-center gap-2 text-[14.5px]">
                    {/^https?:/.test(e) ? (
                      <>
                        <Link2 aria-hidden size={14} className="shrink-0 text-ink-3" />
                        <a href={e} target="_blank" rel="noreferrer" className="min-w-0 truncate text-sea hover:underline">
                          {e.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      </>
                    ) : (
                      <>
                        <FileText aria-hidden size={14} className="shrink-0 text-ink-3" />
                        <span className="min-w-0 truncate text-ink">{e}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {a.route.length ? (
            <div>
              <h3 className="text-[13px] font-semibold text-ink-3">Route so far</h3>
              <ul className="mt-1.5 space-y-0.5 text-[14.5px] text-ink">
                {a.route.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {a.answers.map((q) => (
            <div key={q.question}>
              <h3 className="text-[13px] font-semibold text-ink-3">{q.question}</h3>
              <p className="mt-0.5 text-[14.5px] text-ink">{q.answer}</p>
            </div>
          ))}
        </aside>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <Button variant="secondary" onClick={() => onDecide('pass')} aria-label={`Decline ${a.name}`}>
          <X aria-hidden size={16} /> Decline
        </Button>
        <Button onClick={() => onDecide('invite')} aria-label={`Accept ${a.name}`}>
          <Check aria-hidden size={16} /> Accept
        </Button>
      </div>
    </div>
  )
}

export function Admit() {
  const { state, update, go } = useApp()
  const [openId, setOpenId] = useState<string | null>(null)

  // Out-of-order entry: fall back to Kimi's example application so the view is never empty.
  const event =
    EVENTS.find((e) => e.id === state.programme.eventId) ?? EVENTS.find((e) => e.id === DEFAULT_EVENT_ID) ?? EVENTS[0]
  const hasApp = state.programme.eventId === event.id && state.programme.paths.length > 0
  const pr = hasApp
    ? state.programme
    : { ...EMPTY_PROGRAMME, ...EXAMPLE_EVIDENCE, eventId: event.id, answers: event.example, home: 'Espoo', files: [rememberExampleCertificate()] }
  const hasRoute = state.prescreen.roles.some((r) => r.title.trim()) || state.prescreen.learning.trim()
  const route = hasRoute ? state.prescreen : { ...state.prescreen, ...EXAMPLE_PRESCREEN }
  const req = checkRequest(pr, route, event)
  const key = checkKey(req)
  const deep = state.deepCheck?.key === key ? state.deepCheck : null

  useEffect(() => {
    if (deep) return
    let alive = true
    void runCheck(req).then((r) => alive && update({ deepCheck: { key, ...r } }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const you: Applicant = {
    id: YOU.id,
    name: YOU.name,
    initials: YOU.initials,
    home: pr.home,
    fields: req.answers.flatMap((a) => (/work|area|interest/i.test(a.question) ? a.answer.split(', ') : [])),
    paths: pr.paths,
    evidence: [...req.links, ...req.files.map((f) => f.name)],
    answers: req.answers,
    route: [...req.roles.map((r) => `${r.title}${r.years ? `, ${r.years}` : ''}`), ...(req.learning ? [`Learning: ${req.learning}`] : [])],
    check: deep ? { data: deep.data, source: deep.source } : null,
    isNew: true,
  }
  const others: Applicant[] = PROGRAMME_APPLICANTS.map((a) => ({
    id: a.id,
    name: a.name,
    initials: a.initials,
    home: a.home,
    fields: a.fields,
    paths: a.paths,
    evidence: a.evidence,
    answers: [{ question: 'In their words', answer: a.hope }],
    route: [],
    check: { data: a.check, source: 'written' },
  }))
  const list = [you, ...others]
  const accepted = list.filter((a) => state.admissions[a.id] === 'invite')
  const openIndex = list.findIndex((a) => a.id === openId)

  const decide = (id: string, d: Decision) => {
    update((s) => ({ admissions: { ...s.admissions, [id]: d } }))
    // Move on to the next applicant still to review, or back to the list when done.
    const after = [...list.slice(openIndex + 1), ...list.slice(0, openIndex)]
    const next = after.find((a) => a.id !== id && !state.admissions[a.id])
    setOpenId(next ? next.id : null)
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <StepHeader
        title="Event applications"
        aside={
          <FillButton onClick={() => update({ admissions: Object.fromEntries(SAMPLE_ADMITS.map((id) => [id, 'invite' as const])) })} />
        }
      />

      {openIndex >= 0 ? (
        <Detail
          a={list[openIndex]}
          index={openIndex}
          total={list.length}
          decision={state.admissions[list[openIndex].id]}
          onBack={() => setOpenId(null)}
          onDecide={(d) => decide(list[openIndex].id, d)}
          onPrev={() => setOpenId(list[Math.max(0, openIndex - 1)].id)}
          onNext={() => setOpenId(list[Math.min(list.length - 1, openIndex + 1)].id)}
        />
      ) : (
        <>
          <ul className="divide-y divide-line border-y border-line">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(a.id)
                    window.scrollTo({ top: 0 })
                  }}
                  aria-label={`Open application: ${a.name}`}
                  className="flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-mist-soft sm:px-3"
                >
                  <Avatar initials={a.initials} size={44} muted={state.admissions[a.id] === 'pass'} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-[17px] font-semibold text-ink">
                      {a.name}
                      {a.isNew ? <span className="rounded-full bg-metro px-2 py-0.5 text-[12px] font-bold text-ink">New</span> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] text-ink-3">
                      {a.home}. Applying through {a.paths.map((p) => pathLabel(p).toLowerCase()).join(', ')}
                    </span>
                  </span>
                  <StatusPill d={state.admissions[a.id]} />
                  <ChevronRight aria-hidden size={18} className="shrink-0 text-ink-3" />
                </button>
              </li>
            ))}
          </ul>

          <div className="sticky bottom-0 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
            <p className="text-[15px] text-ink-2">{accepted.length ? `${accepted.length} accepted` : 'No one accepted yet'}</p>
            <Button disabled={!accepted.length} onClick={() => go('refine')}>
              Continue to matchmaking <ArrowRight aria-hidden size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
