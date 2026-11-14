import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Download, ExternalLink, FileText, Link2, MapPin, Paperclip, Plus, X } from 'lucide-react'
import {
  EMPTY_PROGRAMME,
  DEFAULT_EVENT_ID,
  EVENTS,
  EXAMPLE_EVIDENCE,
  PATHS,
  type Attachment,
  type PathId,
  EXAMPLE_LINKEDIN,
  EXAMPLE_PRESCREEN,
  HOMES,
  YOU,
  type Answer,
  type EspooEvent,
  type EventQuestion,
  type Prescreen,
  type Programme as ProgrammeData,
} from '../data/demo'
import { useApp } from '../state/app'
import { checkKey, checkRequest, forgetFile, readAsBase64, rememberExampleCertificate, rememberFile, runCheck } from '../lib/check'
import { RouteEditor } from './RouteEditor'
import { Avatar, Button, FillButton, StepHeader, cx } from './ui/primitives'

const pill = (on: boolean) =>
  cx(
    'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-[15px] font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-metro',
    on ? 'border-sea bg-sea text-white' : 'border-line-strong text-ink-2 hover:border-sea hover:text-sea',
  )

function EventList({ onPick }: { onPick: (id: string) => void }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {EVENTS.map((e) => (
        <li key={e.id} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
          <div className="min-w-0">
            <p className="display text-[22px] font-semibold text-ink">{e.name}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden size={14} /> {e.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden size={14} /> {e.place}
              </span>
            </p>
            <p className="mt-2 text-[15.5px] text-ink-2">{e.about}</p>
            <a
              href={e.source}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[14px] font-medium text-sea hover:underline"
            >
              Event page <ExternalLink aria-hidden size={13} />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onPick(e.id)} aria-label={`Join: ${e.name}`}>
            Join <ArrowRight aria-hidden size={15} />
          </Button>
        </li>
      ))}
    </ul>
  )
}

function Question({ q, value, onChange }: { q: EventQuestion; value: Answer | undefined; onChange: (v: Answer) => void }) {
  if (q.kind === 'text') {
    return (
      <div>
        <label htmlFor={`q-${q.id}`} className="display text-[22px] font-semibold text-ink">
          {q.label}
        </label>
        <textarea
          id={`q-${q.id}`}
          rows={2}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full resize-y rounded-[8px] border border-line-strong px-3.5 py-2.5 text-[16px] focus:border-sea focus:outline-none"
        />
      </div>
    )
  }
  const list = Array.isArray(value) ? value : []
  return (
    <fieldset>
      <legend className="display text-[22px] font-semibold text-ink">{q.label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {q.options?.map((o) =>
          q.kind === 'single' ? (
            <label key={o} className={pill(value === o)}>
              <input type="radio" name={`q-${q.id}`} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
              {o}
            </label>
          ) : (
            <button
              key={o}
              type="button"
              aria-pressed={list.includes(o)}
              onClick={() => onChange(list.includes(o) ? list.filter((x) => x !== o) : [...list, o])}
              className={pill(list.includes(o))}
            >
              {list.includes(o) ? <Check aria-hidden size={14} /> : null}
              {o}
            </button>
          ),
        )}
      </div>
    </fieldset>
  )
}

/** Paste LinkedIn profile text; Gemini extracts roles and self-taught learning into the route. */
function LinkedInFill({ onImport }: { onImport: (route: Pick<Prescreen, 'roles' | 'learning'>) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [count, setCount] = useState(0)

  const run = async () => {
    setStatus('loading')
    try {
      const r = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(30000),
      })
      const data = (await r.json()) as { roles?: { title: string; years: string }[]; learning?: string; error?: string }
      if (!data.roles?.length && !data.learning) throw new Error(data.error ?? 'Nothing found')
      onImport({ roles: data.roles?.length ? data.roles : [{ title: '', years: '' }], learning: data.learning ?? '' })
      setCount(data.roles?.length ?? 0)
      setStatus('done')
      setOpen(false)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mb-6">
      {!open ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            <Download aria-hidden size={15} /> Fill from LinkedIn
          </Button>
          {status === 'done' ? (
            <p role="status" className="flex items-center gap-1.5 text-[14px] text-sea">
              <Check aria-hidden size={15} /> Imported {count} {count === 1 ? 'role' : 'roles'}. Check and edit below.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[12px] border border-line p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label htmlFor="linkedin-text" className="text-[16px] font-semibold text-ink">
              Paste your LinkedIn profile
            </label>
            <Button variant="ghost" size="sm" onClick={() => setText(EXAMPLE_LINKEDIN)}>
              Use example profile
            </Button>
          </div>
          <p className="mt-1 text-[14px] text-ink-3">
            On LinkedIn, open your profile, choose More → Save to PDF, and copy the text here. AI picks out your roles and
            what you've learned. Nothing is stored.
          </p>
          <textarea
            id="linkedin-text"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-3 w-full resize-y rounded-[8px] border border-line-strong px-3.5 py-2.5 text-[15px] focus:border-sea focus:outline-none"
          />
          {status === 'error' ? (
            <p role="alert" className="mt-1.5 text-[14px] text-clay">
              Couldn't read that profile. Fill in your route below instead.
            </p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={run} disabled={!text.trim() || status === 'loading'}>
              {status === 'loading' ? 'Reading profile…' : 'Import'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const fieldCls =
  'h-10 w-full rounded-[8px] border border-line-strong px-3 text-[15px] placeholder:text-ink-3 focus:border-sea focus:outline-none'

/** File picker that keeps contents in memory for the AI check and records names in the application. */
function FilePick({ id, label, multiple, onAdd }: { id: string; label: string; multiple?: boolean; onAdd: (files: Attachment[]) => void }) {
  return (
    <label
      htmlFor={id}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-sea px-3 text-[14px] font-semibold text-sea hover:bg-sea-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-metro"
    >
      <Paperclip aria-hidden size={15} /> {label}
      <input
        id={id}
        type="file"
        multiple={multiple}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx,video/*"
        className="sr-only"
        onChange={async (e) => {
          const list = Array.from(e.target.files ?? [])
          const added: Attachment[] = []
          for (const f of list) {
            if (f.size <= 6 * 1024 * 1024) rememberFile(f.name, f.type, await readAsBase64(f))
            added.push({ name: f.name, size: f.size, type: f.type })
          }
          onAdd(added)
          e.target.value = ''
        }}
      />
    </label>
  )
}

function Paths({ event }: { event: EspooEvent }) {
  const { state, update } = useApp()
  const pr = state.programme
  const setPr = (patch: Partial<ProgrammeData>) => update((s) => ({ programme: { ...s.programme, ...patch } }))
  const toggle = (id: PathId) => setPr({ paths: pr.paths.includes(id) ? pr.paths.filter((p) => p !== id) : [...pr.paths, id] })
  return (
    <section aria-labelledby="paths-title">
      <h2 id="paths-title" className="display text-[22px] font-semibold text-ink">
        How are you applying?
      </h2>
      <p className="mt-1 text-[15px] text-ink-3">Pick one or more paths. Any of them can get you in.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="paths-title">
        {PATHS.map((p) => {
          const on = pr.paths.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(p.id)}
              className={cx(
                'flex items-start gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors',
                on ? 'border-sea bg-sea-soft' : 'border-line-strong hover:border-sea',
              )}
            >
              <span
                aria-hidden
                className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-2', on ? 'border-sea bg-sea text-white' : 'border-line-strong')}
              >
                {on ? <Check size={13} strokeWidth={3} /> : null}
              </span>
              <span>
                <span className="block text-[15.5px] font-semibold text-ink">{p.label}</span>
                <span className="block text-[13.5px] text-ink-3">{p.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-5 space-y-5">
        {pr.paths.includes('referral') ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ref-name" className="text-[14.5px] font-semibold text-ink">
                Who referred you?
              </label>
              <input id="ref-name" value={pr.referral.name} onChange={(e) => setPr({ referral: { ...pr.referral, name: e.target.value } })} className={cx(fieldCls, 'mt-1')} />
            </div>
            <div>
              <label htmlFor="ref-rel" className="text-[14.5px] font-semibold text-ink">
                How do they know you?
              </label>
              <input id="ref-rel" value={pr.referral.relation} onChange={(e) => setPr({ referral: { ...pr.referral, relation: e.target.value } })} placeholder="e.g. Former manager" className={cx(fieldCls, 'mt-1')} />
            </div>
          </div>
        ) : null}
        {pr.paths.includes('degree') ? (
          <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
            <div>
              <label htmlFor="deg-name" className="text-[14.5px] font-semibold text-ink">
                Degree
              </label>
              <input id="deg-name" value={pr.degree.name} onChange={(e) => setPr({ degree: { ...pr.degree, name: e.target.value } })} className={cx(fieldCls, 'mt-1')} />
            </div>
            <div>
              <label htmlFor="deg-school" className="text-[14.5px] font-semibold text-ink">
                School
              </label>
              <input id="deg-school" value={pr.degree.school} onChange={(e) => setPr({ degree: { ...pr.degree, school: e.target.value } })} className={cx(fieldCls, 'mt-1')} />
            </div>
            <div>
              <label htmlFor="deg-year" className="text-[14.5px] font-semibold text-ink">
                Year
              </label>
              <input id="deg-year" value={pr.degree.year} onChange={(e) => setPr({ degree: { ...pr.degree, year: e.target.value } })} className={cx(fieldCls, 'mt-1')} />
            </div>
          </div>
        ) : null}
        {pr.paths.includes('experience') ? (
          <p className="text-[14.5px] text-ink-2">Previous experience: fill in your route so far below.</p>
        ) : null}
        {pr.paths.includes('assignment') ? (
          <div className="rounded-[10px] bg-mist-soft p-4">
            <p className="text-[13px] font-semibold text-ink-3">Event assignment</p>
            <p className="mt-0.5 text-[16px] font-semibold text-ink">{event.assignment}</p>
            <label htmlFor="assign-link" className="mt-3 block text-[14.5px] font-semibold text-ink">
              Link to your answer
            </label>
            <input
              id="assign-link"
              value={pr.assignment.link}
              onChange={(e) => setPr({ assignment: { ...pr.assignment, link: e.target.value } })}
              placeholder="Video or file link"
              className={cx(fieldCls, 'mt-1 bg-white')}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <FilePick id="assign-file" label="Or upload a file" onAdd={(f) => f[0] && setPr({ assignment: { ...pr.assignment, file: f[0].name } })} />
              {pr.assignment.file ? <span className="text-[14px] text-ink-2">{pr.assignment.file}</span> : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function Evidence() {
  const { state, update } = useApp()
  const pr = state.programme
  const setPr = (patch: Partial<ProgrammeData>) => update((s) => ({ programme: { ...s.programme, ...patch } }))
  return (
    <section aria-labelledby="evidence-title">
      <h2 id="evidence-title" className="display text-[22px] font-semibold text-ink">
        Links and files
      </h2>
      <p className="mt-1 text-[15px] text-ink-3">LinkedIn, portfolio, certificates or a CV. AI reads them for the Espoo team's background check. Nothing is stored.</p>
      <ul className="mt-4 space-y-2">
        {pr.links.map((l, i) => (
          <li key={i} className="flex items-center gap-2">
            <Link2 aria-hidden size={16} className="shrink-0 text-ink-3" />
            <label htmlFor={`link-${i}`} className="sr-only">
              Link {i + 1}
            </label>
            <input
              id={`link-${i}`}
              type="url"
              value={l}
              onChange={(e) => setPr({ links: pr.links.map((x, j) => (j === i ? e.target.value : x)) })}
              placeholder="https://"
              className={fieldCls}
            />
            <button
              type="button"
              aria-label={`Remove link ${i + 1}`}
              onClick={() => setPr({ links: pr.links.length > 1 ? pr.links.filter((_, j) => j !== i) : [''] })}
              className="grid size-10 shrink-0 place-items-center rounded-[8px] text-ink-3 hover:bg-mist-soft hover:text-ink"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setPr({ links: [...pr.links, ''] })}>
          <Plus aria-hidden size={15} /> Add a link
        </Button>
        <FilePick id="evidence-files" label="Attach files" multiple onAdd={(f) => setPr({ files: [...pr.files, ...f.filter((x) => !pr.files.some((y) => y.name === x.name))] })} />
      </div>
      {pr.files.length ? (
        <ul className="mt-3 space-y-1.5">
          {pr.files.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-[14.5px] text-ink">
              <FileText aria-hidden size={15} className="shrink-0 text-ink-3" />
              <span className="min-w-0 truncate">{f.name}</span>
              <span className="shrink-0 text-[13px] text-ink-3">{Math.max(1, Math.round(f.size / 1024))} KB</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => {
                  forgetFile(f.name)
                  setPr({ files: pr.files.filter((x) => x.name !== f.name) })
                }}
                className="grid size-8 shrink-0 place-items-center rounded-[6px] text-ink-3 hover:bg-mist-soft hover:text-ink"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function EventForm({ event }: { event: EspooEvent }) {
  const { state, update, go } = useApp()
  const pr = state.programme
  const setPr = (patch: Partial<ProgrammeData>) => update((s) => ({ programme: { ...s.programme, ...patch } }))
  const setRoute = (patch: Partial<Prescreen>) => update((s) => ({ prescreen: { ...s.prescreen, ...patch } }))
  const hasRoute = state.prescreen.roles.some((r) => r.title.trim()) || state.prescreen.learning.trim()
  const ready = Boolean(pr.home && hasRoute && pr.paths.length)

  const submit = () => {
    setPr({ submitted: true })
    // Start the Espoo team's background check now so it is ready on the next step.
    const req = checkRequest(pr, state.prescreen, event)
    void runCheck(req).then((r) => update({ deepCheck: { key: checkKey(req), ...r } }))
  }

  if (pr.submitted) {
    return (
      <div role="status" className="rounded-[12px] border-2 border-sea p-8 text-center">
        <CheckCircle2 aria-hidden size={36} className="mx-auto text-sea" />
        <p className="display mt-3 text-[26px] font-semibold text-ink">Application sent</p>
        <p className="mt-1 text-[16px] text-ink-3">The Espoo team reads every application and will get back to you.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => go('admit')}>
            See it as the Espoo team <ArrowRight aria-hidden size={17} />
          </Button>
          <Button variant="ghost" onClick={() => setPr({ submitted: false })}>
            Edit application
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {event.questions.map((q) => (
        <Question
          key={q.id}
          q={q}
          value={pr.answers[q.id]}
          onChange={(v) => setPr({ answers: { ...pr.answers, [q.id]: v } })}
        />
      ))}

      <Paths event={event} />

      <fieldset>
        <legend className="display text-[22px] font-semibold text-ink">Where do you live?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOMES.map((h) => (
            <label key={h} className={pill(pr.home === h)}>
              <input type="radio" name="home" className="sr-only" checked={pr.home === h} onChange={() => setPr({ home: h })} />
              {h}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <LinkedInFill onImport={(route) => setRoute(route)} />
        <RouteEditor p={state.prescreen} set={setRoute} />
      </div>

      <Evidence />

      <div className="flex flex-col items-end gap-2">
        <Button onClick={submit} disabled={!ready}>
          Send application <ArrowRight aria-hidden size={17} />
        </Button>
        {!ready ? <p className="text-[13px] text-ink-3">Pick a path, where you live, and at least one role or something you've learned.</p> : null}
      </div>
    </div>
  )
}

export function Programme() {
  const { state, update } = useApp()
  const event = EVENTS.find((e) => e.id === state.programme.eventId) ?? null

  const fill = () => {
    const target = event ?? EVENTS.find((e) => e.id === DEFAULT_EVENT_ID) ?? EVENTS[0]
    update((s) => ({
      programme: {
        ...EMPTY_PROGRAMME,
        ...EXAMPLE_EVIDENCE,
        eventId: target.id,
        answers: { ...target.example },
        home: 'Espoo',
        files: [rememberExampleCertificate()],
      },
      prescreen: { ...s.prescreen, ...EXAMPLE_PRESCREEN },
    }))
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <StepHeader
        title={event ? event.name : 'Join an event'}
        lede={event ? `${event.date}, ${event.place}` : undefined}
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-[14px] text-ink-2">
              <Avatar initials={YOU.initials} size={32} /> {YOU.name}
            </span>
            <FillButton onClick={fill} />
          </div>
        }
      />
      {event ? (
        <>
          <button
            type="button"
            onClick={() => update((s) => ({ programme: { ...s.programme, eventId: null, submitted: false } }))}
            className="mb-8 inline-flex items-center gap-1.5 rounded text-[15px] font-medium text-sea hover:underline"
          >
            <ArrowLeft aria-hidden size={16} /> All events
          </button>
          <EventForm event={event} />
        </>
      ) : (
        <EventList
          onPick={(id) => update((s) => ({ programme: { ...s.programme, eventId: id, answers: {}, submitted: false } }))}
        />
      )}
    </div>
  )
}
