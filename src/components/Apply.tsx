import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Lock, Search, Wand2 } from 'lucide-react'
import {
  COMPANY,
  EXAMPLE_ANSWERS,
  EXAMPLE_POSTING,
  FIELDS,
  MOTIVATION_GUIDE,
  OTHER_JOBS,
  PRETASK,
  YOU,
  type Job,
  type Posting,
} from '../data/demo'
import { useApp } from '../state/app'
import { Avatar, Button, FillButton, StepHeader, cx } from './ui/primitives'

const MIN = 40

/** The company's own posting from step 1, as a job on the board. */
export function companyJob(p: Posting): Job {
  return {
    id: 'northstar',
    company: COMPANY.name,
    initials: COMPANY.initials,
    field: 'Customer experience',
    title: p.title || EXAMPLE_POSTING.title,
    challenge: p.challenge.trim() || EXAMPLE_POSTING.challenge,
    place: COMPANY.place,
    qualifications: p.qualifications,
    reasons: p.reasons,
    pretask: {
      title: p.pretaskTitle.trim() || PRETASK.title,
      prompt: p.pretaskPrompt.trim() || PRETASK.prompt,
    },
  }
}

export function Required({ q }: { q: string[] }) {
  return q.length ? (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-2">
      {q.map((x) => (
        <li key={x} className="flex items-center gap-1.5">
          <Lock aria-hidden size={13} className="text-ink-3" />
          {x}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-[14px] text-ink-3">Nothing formal required</p>
  )
}

export function JobBoard({ jobs, onPick }: { jobs: Job[]; onPick: (id: string) => void }) {
  const [field, setField] = useState('All')
  const [query, setQuery] = useState('')
  const [noReqs, setNoReqs] = useState(false)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter(
      (j) =>
        (field === 'All' || j.field === field) &&
        (!noReqs || j.qualifications.length === 0) &&
        (!q || `${j.title} ${j.company} ${j.challenge}`.toLowerCase().includes(q)),
    )
  }, [jobs, field, query, noReqs])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by field">
          {FIELDS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={field === f}
              onClick={() => setField(f)}
              className={cx(
                'h-9 rounded-full border px-3.5 text-[14px] font-medium transition-colors',
                field === f ? 'border-sea bg-sea text-white' : 'border-line-strong text-ink-2 hover:border-sea hover:text-sea',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="relative block">
            <span className="sr-only">Search jobs</span>
            <Search aria-hidden size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 w-48 rounded-full border border-line-strong pr-3 pl-9 text-[14px] placeholder:text-ink-3 focus:border-sea focus:outline-none"
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-ink-2">
            <input type="checkbox" checked={noReqs} onChange={(e) => setNoReqs(e.target.checked)} className="size-4 accent-sea" />
            No formal requirements
          </label>
        </div>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {shown.map((j) => (
          <li key={j.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-[14px] text-ink-3">
                {j.company}, {j.place}
                {j.id === 'northstar' ? (
                  <span className="rounded-full bg-metro px-2 py-0.5 text-[12px] font-bold text-ink">New</span>
                ) : null}
              </p>
              <p className="display mt-0.5 text-[20px] font-semibold text-ink">{j.title}</p>
              <p className="mt-1 text-[15.5px] text-ink-2">{j.challenge}</p>
              <div className="mt-2">
                <Required q={j.qualifications} />
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onPick(j.id)} aria-label={`Apply: ${j.title}`}>
              Apply <ArrowRight aria-hidden size={15} />
            </Button>
          </li>
        ))}
      </ul>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-[16px] text-ink-3">
          No jobs match.{' '}
          <button
            type="button"
            className="font-medium text-sea hover:underline"
            onClick={() => {
              setField('All')
              setQuery('')
              setNoReqs(false)
            }}
          >
            Clear filters
          </button>
        </p>
      ) : null}
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  onExample,
  error,
  rows = 5,
}: {
  id: string
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  onExample?: () => void
  error: boolean
  rows?: number
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-[18px] font-semibold text-ink">
          {label}
        </label>
        {onExample ? (
          <Button variant="ghost" size="sm" onClick={onExample}>
            <Wand2 aria-hidden size={14} /> Use example
          </Button>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="mb-2 text-[14px] text-ink-3">
        {hint}
      </p>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={error ? `${id}-hint ${id}-error` : `${id}-hint`}
        aria-invalid={error || undefined}
        className={cx(
          'w-full resize-y rounded-[8px] border bg-white px-4 py-3 text-[16px] leading-relaxed text-ink focus:outline-none',
          error ? 'border-clay' : 'border-line-strong focus:border-sea',
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[14px] text-clay">
          A few sentences, please.
        </p>
      ) : null}
    </div>
  )
}

/** One main written answer, guided by three parts. */
function Motivation({
  value,
  onChange,
  onExample,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onExample?: () => void
  error: boolean
}) {
  const g = MOTIVATION_GUIDE
  return (
    <section aria-labelledby="motivation-heading">
      <h2 id="motivation-heading" className="display text-[26px] leading-snug font-semibold text-ink">
        {g.heading}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[16px] text-ink-2">
        {g.intro} {g.reassurance}
      </p>

      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {g.parts.map((part, i) => (
          <li key={part.title} className="flex gap-3">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full border-[3px] border-sea text-[13px] font-bold text-sea"
            >
              {i + 1}
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-ink">{part.title}</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-ink-3">{part.prompt}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-6 rounded-[8px] bg-sea-soft px-4 py-3 text-[15px] text-sea-deep">{g.careerChange}</p>

      <details className="group mt-4 rounded-[8px] border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold text-ink">
          <span>
            See an example: <span className="font-normal text-ink-2">{g.exampleTitle}</span>
          </span>
          <ChevronDown aria-hidden size={18} className="shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-line px-4 py-4">
          {g.example.map((e) => (
            <div key={e.part} className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-4">
              <p className="text-[13px] font-semibold text-sea">{e.part}</p>
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{e.text}</p>
            </div>
          ))}
        </div>
      </details>
      <div className="mt-6 mb-2 flex items-end justify-between gap-3">
        <label htmlFor="motivation" className="text-[15px] font-semibold text-ink">
          Your answer
        </label>
        {onExample ? (
          <Button variant="ghost" size="sm" onClick={onExample}>
            <Wand2 aria-hidden size={14} /> Use example
          </Button>
        ) : null}
      </div>
      <textarea
        id="motivation"
        rows={9}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={error ? 'motivation-error' : undefined}
        placeholder={g.placeholder}
        aria-invalid={error || undefined}
        className={cx(
          'w-full resize-y rounded-[8px] border bg-white px-4 py-3 text-[16px] leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none',
          error ? 'border-clay' : 'border-line-strong focus:border-sea',
        )}
      />
      {error ? (
        <p id="motivation-error" className="mt-1.5 text-[14px] text-clay">
          A few sentences, please.
        </p>
      ) : null}

    </section>
  )
}

function Application({ job }: { job: Job }) {
  const { state, update, go } = useApp()
  const [tried, setTried] = useState(false)
  const motivationShort = state.motivation.trim().length < MIN
  const pretaskShort = state.pretask.trim().length < MIN
  const isCompany = job.id === 'northstar'

  return (
    <div className="mx-auto max-w-[760px]">
      <button
        type="button"
        onClick={() => update({ jobId: null, submitted: false })}
        className="mb-6 inline-flex items-center gap-1.5 rounded text-[15px] font-medium text-sea hover:underline"
      >
        <ArrowLeft aria-hidden size={16} /> All jobs
      </button>

      <div className="mb-10 rounded-[12px] border border-line p-5">
        <p className="text-[14px] text-ink-3">
          {job.company}, {job.place}
        </p>
        <h2 className="display mt-0.5 text-[24px] leading-snug font-semibold text-ink">{job.title}</h2>
        <p className="mt-1 text-[16px] text-ink-2">{job.challenge}</p>
        <div className="mt-3 border-t border-line pt-3">
          <Required q={job.qualifications} />
        </div>
      </div>

      {state.submitted ? (
        <div role="status" className="rounded-[12px] border-2 border-sea p-8 text-center">
          <CheckCircle2 aria-hidden size={36} className="mx-auto text-sea" />
          <p className="display mt-3 text-[26px] font-semibold text-ink">Application sent</p>
          <p className="mt-1 text-[16px] text-ink-3">A person at {job.company} will read both answers.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isCompany ? (
              <Button onClick={() => go('choose')}>
                See it as the company <ArrowRight aria-hidden size={17} />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => update({ jobId: null, submitted: false })}
            >
              Back to jobs
            </Button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            setTried(true)
            if (!motivationShort && !pretaskShort) update({ submitted: true })
          }}
          className="space-y-10"
        >
          <Motivation
            value={state.motivation}
            onChange={(v) => update({ motivation: v })}
            onExample={isCompany ? () => update({ motivation: EXAMPLE_ANSWERS.motivation }) : undefined}
            error={tried && motivationShort}
          />

          <section aria-labelledby="pretask-title" className="rounded-[12px] bg-mist-soft p-5 sm:p-6">
            <p className="text-[14px] font-semibold text-ink-3">Pre-task, about 10 minutes</p>
            <h2 id="pretask-title" className="display mt-1 text-[22px] font-semibold text-ink">
              {job.pretask.title}
            </h2>
            <p className="mt-1 mb-5 text-[16px] text-ink-2">{job.pretask.prompt}</p>
            <Field
              id="pretask"
              label="Your approach"
              hint="There is no right answer. We want to see how you think."
              value={state.pretask}
              onChange={(v) => update({ pretask: v })}
              onExample={isCompany ? () => update({ pretask: EXAMPLE_ANSWERS.pretask }) : undefined}
              error={tried && pretaskShort}
            />
          </section>

          <div className="flex justify-end">
            <Button type="submit">
              Send application <ArrowRight aria-hidden size={17} />
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export function Apply() {
  const { state, update } = useApp()
  const jobs = useMemo(() => [companyJob(state.posting), ...OTHER_JOBS], [state.posting])
  const job = jobs.find((j) => j.id === state.jobId) ?? null

  return (
    <div>
      <StepHeader
        title={job ? 'Apply' : 'Find a job'}
        lede={job ? 'No CV screening. Tell them why, and show how you think.' : 'Each job lists only what is truly required.'}
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-[14px] text-ink-2">
              <Avatar initials={YOU.initials} size={32} /> {YOU.name}
            </span>
            <FillButton
              onClick={() =>
                update({
                  jobId: (job ?? jobs[0]).id,
                  motivation: EXAMPLE_ANSWERS.motivation,
                  pretask: EXAMPLE_ANSWERS.pretask,
                  submitted: false,
                })
              }
            />
          </div>
        }
      />
      {job ? (
        <Application job={job} />
      ) : (
        <JobBoard jobs={jobs} onPick={(id) => update({ jobId: id, submitted: false, motivation: '', pretask: '' })} />
      )}
    </div>
  )
}
