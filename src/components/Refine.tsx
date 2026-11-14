import { useState, type ReactNode } from 'react'
import { ArrowRight, Check, Lock, Plus, Wand2 } from 'lucide-react'
import { COMPANY, EXAMPLE_POSTING, QUESTIONS, type Posting } from '../data/demo'
import { useApp } from '../state/app'
import { Button, FillButton, StepHeader, cx } from './ui/primitives'

type ListKey = 'work' | 'strengths' | 'learn' | 'support' | 'qualifications'

function Question({ n, id, label, hint, children }: { n: number; id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3 border-t border-line py-7 sm:grid-cols-[36px_1fr]">
      <span aria-hidden className="grid size-8 place-items-center rounded-full border-[3px] border-sea text-[14px] font-bold text-sea">
        {n}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-[18px] leading-snug font-semibold text-ink">
          {label}
        </h2>
        {hint ? <p className="mt-0.5 text-[14px] text-ink-3">{hint}</p> : null}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  )
}

function Chip({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-medium transition-colors disabled:opacity-40',
        on ? 'border-sea bg-sea text-white' : 'border-line-strong text-ink-2 hover:border-sea hover:text-sea',
      )}
    >
      {on ? <Check aria-hidden size={14} /> : null}
      {children}
    </button>
  )
}

/** Toggle suggested options, or add your own. */
function Picker({
  listKey,
  options,
  value,
  onChange,
  max,
  addLabel,
}: {
  listKey: ListKey
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  max?: number
  addLabel: string
}) {
  const [draft, setDraft] = useState('')
  const all = [...options, ...value.filter((v) => !options.includes(v))]
  const full = max !== undefined && value.length >= max
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  return (
    <div className="flex flex-wrap items-center gap-2">
      {all.map((o) => (
        <Chip key={o} on={value.includes(o)} onClick={() => toggle(o)} disabled={full && !value.includes(o)}>
          {o}
        </Chip>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const v = draft.trim()
          if (v && !value.includes(v) && !full) onChange([...value, v])
          setDraft('')
        }}
        className="flex items-center"
      >
        <label htmlFor={`add-${listKey}`} className="sr-only">
          {addLabel}
        </label>
        <input
          id={`add-${listKey}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={addLabel}
          disabled={full}
          className="h-9 w-44 rounded-l-full border border-r-0 border-dashed border-line-strong px-3.5 text-[14px] placeholder:text-ink-3 focus:border-sea focus:outline-none disabled:opacity-40"
        />
        <button
          type="submit"
          aria-label={addLabel}
          disabled={full || !draft.trim()}
          className="grid h-9 w-9 place-items-center rounded-r-full border border-dashed border-line-strong text-ink-2 hover:text-sea disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </form>
    </div>
  )
}

function CardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="text-[13px] font-semibold text-ink-3">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Dots({ items }: { items: string[] }) {
  return (
    <ul className="space-y-0.5 text-[15px] text-ink-2">
      {items.map((w) => (
        <li key={w} className="flex gap-2">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-sea" />
          {w}
        </li>
      ))}
    </ul>
  )
}

/** The Opportunity Card built from the answers. */
function Preview({ p }: { p: Posting }) {
  const ready = p.challenge.trim().length > 0
  return (
    <article className={cx('rounded-[12px] border p-6 transition-colors', ready ? 'border-sea' : 'border-line')}>
      <p className="text-[14px] text-ink-3">{COMPANY.name}</p>
      <h3 className="display mt-1 text-[24px] leading-snug font-semibold text-ink">{p.title || 'Untitled role'}</h3>
      <CardSection title="The impact you'll make">
        <p className={cx('text-[15.5px]', ready ? 'text-ink' : 'text-ink-3')}>
          {ready ? p.challenge : 'Answer question 1 to describe the impact.'}
        </p>
      </CardSection>
      {p.work.length ? (
        <CardSection title="What you'll work on">
          <Dots items={p.work} />
        </CardSection>
      ) : null}
      {p.strengths.length ? (
        <CardSection title="What will help you succeed">
          <ul className="flex flex-wrap gap-1.5">
            {p.strengths.map((m) => (
              <li key={m} className="rounded-full border border-line px-2.5 py-0.5 text-[13px] text-ink-2">
                {m}
              </li>
            ))}
          </ul>
        </CardSection>
      ) : null}
      {p.learn.length || p.support.length ? (
        <CardSection title="What you can learn">
          {p.learn.length ? <Dots items={p.learn} /> : null}
          {p.support.length ? (
            <p className="mt-1.5 text-[14.5px] text-ink-2">
              <span className="font-semibold text-ink">Support: </span>
              {p.support.join(', ')}
            </p>
          ) : null}
        </CardSection>
      ) : null}
      <CardSection title="What you genuinely need">
        {p.qualifications.length ? (
          <ul className="space-y-1.5 text-[15px] text-ink">
            {p.qualifications.map((q) => (
              <li key={q} className="flex gap-2">
                <Lock aria-hidden size={14} className="mt-1 shrink-0 text-ink-3" />
                <span>
                  {q}
                  {p.reasons[q]?.trim() ? <span className="block text-[13.5px] text-ink-3">{p.reasons[q]}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-ink-2">Nothing formal.</p>
        )}
      </CardSection>
      {p.pretaskTitle.trim() ? (
        <CardSection title="Your pre-task">
          <p className="text-[15px] font-semibold text-ink">{p.pretaskTitle}</p>
          {p.pretaskPrompt.trim() ? <p className="text-[14.5px] text-ink-2">{p.pretaskPrompt}</p> : null}
        </CardSection>
      ) : null}
    </article>
  )
}

export function Refine() {
  const { state, update, go } = useApp()
  const p = state.posting
  const set = (patch: Partial<Posting>) => update((s) => ({ posting: { ...s.posting, ...patch }, published: false }))
  const ready = p.challenge.trim().length > 0

  return (
    <div>
      <StepHeader
        title="Refine the job posting"
        aside={<FillButton onClick={() => update({ posting: EXAMPLE_POSTING, published: false })} />}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3 pb-6">
            <label htmlFor="title" className="text-[15px] font-semibold text-ink">
              Role
            </label>
            <input
              id="title"
              value={p.title}
              onChange={(e) => set({ title: e.target.value })}
              className="h-10 min-w-0 flex-1 rounded-[8px] border border-line-strong px-3 text-[16px] focus:border-sea focus:outline-none"
            />
          </div>

          <Question n={1} id="q-challenge" label={QUESTIONS.challenge.label}>
            <ul className="mb-3 space-y-1 text-[15px] text-ink-2">
              {QUESTIONS.challenge.subquestions.map((q) => (
                <li key={q} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-sea" />
                  {q}
                </li>
              ))}
            </ul>
            <div className="mb-2 flex items-end justify-between gap-3">
              <label htmlFor="challenge" className="text-[14.5px] font-semibold text-ink">
                Your answer
              </label>
              <Button variant="ghost" size="sm" onClick={() => set({ challenge: EXAMPLE_POSTING.challenge })}>
                <Wand2 aria-hidden size={14} /> Use example
              </Button>
            </div>
            <textarea
              id="challenge"
              rows={3}
              value={p.challenge}
              onChange={(e) => set({ challenge: e.target.value })}
              className="w-full resize-y rounded-[8px] border border-line-strong px-3.5 py-2.5 text-[16px] placeholder:text-ink-3 focus:border-sea focus:outline-none"
            />
          </Question>

          <Question n={2} id="q-work" label={QUESTIONS.work.label} hint={QUESTIONS.work.hint}>
            <Picker
              listKey="work"
              options={QUESTIONS.work.suggestions}
              value={p.work}
              onChange={(work) => set({ work })}
              max={QUESTIONS.work.max}
              addLabel="Add a task"
            />
          </Question>

          <Question n={3} id="q-strengths" label={QUESTIONS.strengths.label} hint={QUESTIONS.strengths.hint}>
            <Picker
              listKey="strengths"
              options={QUESTIONS.strengths.suggestions}
              value={p.strengths}
              onChange={(strengths) => set({ strengths })}
              max={QUESTIONS.strengths.max}
              addLabel="Add an ability"
            />
          </Question>

          <Question n={4} id="q-learn" label={QUESTIONS.learn.label} hint={QUESTIONS.learn.hint}>
            <Picker listKey="learn" options={QUESTIONS.learn.suggestions} value={p.learn} onChange={(learn) => set({ learn })} addLabel="Add a topic" />
            <p className="mt-5 mb-3 text-[16px] font-semibold text-ink">{QUESTIONS.support.label}</p>
            <Picker
              listKey="support"
              options={QUESTIONS.support.suggestions}
              value={p.support}
              onChange={(support) => set({ support })}
              addLabel="Add support"
            />
          </Question>

          <Question n={5} id="q-quals" label={QUESTIONS.qualifications.label} hint={QUESTIONS.qualifications.hint}>
            <Picker
              listKey="qualifications"
              options={QUESTIONS.qualifications.suggestions}
              value={p.qualifications}
              onChange={(qualifications) => set({ qualifications })}
              addLabel="Add a requirement"
            />
            {p.qualifications.length ? (
              <ul className="mt-5 space-y-3">
                {p.qualifications.map((q, i) => (
                  <li key={q}>
                    <label htmlFor={`reason-${i}`} className="text-[14.5px] font-semibold text-ink">
                      {q}
                    </label>
                    <input
                      id={`reason-${i}`}
                      value={p.reasons[q] ?? ''}
                      onChange={(e) => set({ reasons: { ...p.reasons, [q]: e.target.value } })}
                      placeholder={QUESTIONS.qualifications.reasonPlaceholder}
                      className="mt-1 h-10 w-full rounded-[8px] border border-line-strong px-3 text-[15px] placeholder:text-ink-3 focus:border-sea focus:outline-none"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </Question>

          <Question n={6} id="q-pretask" label={QUESTIONS.pretask.label}>
            <div className="mb-3 flex flex-wrap gap-2">
              {QUESTIONS.pretask.suggestions.map((t) => (
                <Chip
                  key={t.title}
                  on={p.pretaskTitle === t.title && p.pretaskPrompt === t.prompt}
                  onClick={() => set({ pretaskTitle: t.title, pretaskPrompt: t.prompt })}
                >
                  {t.title}
                </Chip>
              ))}
            </div>
            <label htmlFor="pretask-title-input" className="text-[14.5px] font-semibold text-ink">
              Task title
            </label>
            <input
              id="pretask-title-input"
              value={p.pretaskTitle}
              onChange={(e) => set({ pretaskTitle: e.target.value })}
              className="mt-1 mb-3 h-10 w-full rounded-[8px] border border-line-strong px-3 text-[15px] focus:border-sea focus:outline-none"
            />
            <label htmlFor="pretask-prompt-input" className="text-[14.5px] font-semibold text-ink">
              The question
            </label>
            <textarea
              id="pretask-prompt-input"
              rows={2}
              value={p.pretaskPrompt}
              onChange={(e) => set({ pretaskPrompt: e.target.value })}
              className="mt-1 w-full resize-y rounded-[8px] border border-line-strong px-3.5 py-2.5 text-[15px] focus:border-sea focus:outline-none"
            />
          </Question>
        </div>

        <aside aria-labelledby="preview-title" className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="preview-title" className="mb-4 text-[18px] font-semibold text-ink">
            Your posting
          </h2>
          <Preview p={p} />
          <Button
            className="mt-5 w-full"
            disabled={!ready}
            onClick={() => {
              update({ published: true })
              go('apply')
            }}
          >
            Publish <ArrowRight aria-hidden size={17} />
          </Button>
          <p className="mt-2 text-center text-[13px] text-ink-3">
            {ready ? 'You approve what gets published.' : 'Answer question 1 to publish.'}
          </p>
        </aside>
      </div>
    </div>
  )
}
