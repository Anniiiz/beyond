import { useEffect, useState } from 'react'
import { Check, Pause, Play, RotateCcw } from 'lucide-react'
import { APPLICANTS, CHAT_SECONDS, EXAMPLE_ANSWERS, SAMPLE_EVALUATIONS, SCALES, YOU, type Applicant } from '../data/demo'
import { useApp, type Evaluation } from '../state/app'
import { Avatar, Button, FillButton, StepHeader, cx } from './ui/primitives'

const EMPTY: Evaluation = { ratings: {}, notes: '', done: false }

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Countdown for one 8-minute chat. Resets when the person changes. */
function ChatTimer({ personId }: { personId: string }) {
  const [left, setLeft] = useState(CHAT_SECONDS)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    setLeft(CHAT_SECONDS)
    setRunning(false)
  }, [personId])
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((l) => (l <= 1 ? (setRunning(false), 0) : l - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])
  return (
    <div className="flex flex-wrap items-center gap-4">
      <p
        role="timer"
        aria-label={`${fmt(left)} left`}
        className={cx('text-[44px] leading-none font-semibold tracking-[-0.02em]', left === 0 ? 'text-clay' : 'text-ink')}
      >
        {fmt(left)}
      </p>
      <Button variant={running ? 'secondary' : 'primary'} size="sm" onClick={() => setRunning((r) => !r)} disabled={left === 0}>
        {running ? <Pause aria-hidden size={15} /> : <Play aria-hidden size={15} />}
        {running ? 'Pause' : left < CHAT_SECONDS ? 'Resume' : 'Start chat'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Reset timer"
        onClick={() => {
          setRunning(false)
          setLeft(CHAT_SECONDS)
        }}
      >
        <RotateCcw aria-hidden size={15} />
      </Button>
    </div>
  )
}

export function Meet() {
  const { state, update } = useApp()
  const you: Applicant = {
    ...YOU,
    submitted: 'Just now',
    motivation: state.motivation.trim() || EXAMPLE_ANSWERS.motivation,
    pretask: state.pretask.trim() || EXAMPLE_ANSWERS.pretask,
  }
  const everyone = [you, ...APPLICANTS]
  const invited = everyone.filter((a) => state.decisions[a.id] === 'invite')
  const people = invited.length ? invited : [you, APPLICANTS[0]]
  const [selectedId, setSelectedId] = useState(people[0].id)
  const person = people.find((p) => p.id === selectedId) ?? people[0]
  const ev = state.evaluations[person.id] ?? EMPTY

  const setEv = (patch: Partial<Evaluation>) =>
    update((s) => ({ evaluations: { ...s.evaluations, [person.id]: { ...(s.evaluations[person.id] ?? EMPTY), ...patch } } }))

  const save = () => {
    setEv({ done: true })
    const next = people.find((p) => p.id !== person.id && !state.evaluations[p.id]?.done)
    if (next) setSelectedId(next.id)
  }

  return (
    <div>
      <StepHeader
        title="8-minute chats"
        lede={`${people.length} people invited. Rate what you saw, add a note if useful.`}
        aside={
          <FillButton
            onClick={() =>
              update((s) => ({
                evaluations: {
                  ...s.evaluations,
                  ...Object.fromEntries(
                    people.map((pp) => [
                      pp.id,
                      { ...(SAMPLE_EVALUATIONS[pp.id] ?? { ratings: { understand: 3, reasoning: 3, adapt: 3 }, notes: '' }), done: true },
                    ]),
                  ),
                },
              }))
            }
          />
        }
      />

      <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        <nav aria-label="Invited people">
          <ul className="space-y-1">
            {people.map((p) => {
              const done = state.evaluations[p.id]?.done
              const active = p.id === person.id
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-sea-soft' : 'hover:bg-mist-soft',
                    )}
                  >
                    <Avatar initials={p.initials} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">{p.name}</span>
                      <span className="block truncate text-[13px] text-ink-3">{done ? 'Rated' : 'Not rated yet'}</span>
                    </span>
                    {done ? <Check aria-label="Rated" size={17} className="text-sea" /> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <section aria-labelledby="person-name" className="min-w-0">
          <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="person-name" className="display text-[26px] font-semibold text-ink">
                {person.name}
              </h2>
              <p className="text-[15px] text-ink-3">{person.background}</p>
            </div>
            <ChatTimer personId={person.id} />
          </div>

          <p className="mt-5 line-clamp-2 max-w-[70ch] text-[15px] text-ink-2">
            <span className="font-semibold text-ink">Their pre-task: </span>
            {person.pretask}
          </p>

          <div className="mt-8 space-y-7">
            {SCALES.map((sc) => {
              const value = ev.ratings[sc.id]
              return (
                <fieldset key={sc.id}>
                  <legend className="mb-2.5 text-[17px] font-semibold text-ink">{sc.label}</legend>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="w-full text-[13px] text-ink-3 sm:w-auto sm:min-w-[150px] sm:text-right">{sc.low}</span>
                    <div className="flex">
                      {[1, 2, 3, 4].map((n) => (
                        <label
                          key={n}
                          className={cx(
                            'grid h-11 w-14 cursor-pointer place-items-center border text-[16px] font-semibold transition-colors first:rounded-l-[8px] last:rounded-r-[8px] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-metro [&+&]:-ml-px',
                            value === n ? 'z-10 border-sea bg-sea text-white' : 'border-line-strong text-ink-2 hover:text-sea',
                          )}
                        >
                          <input
                            type="radio"
                            name={`${person.id}-${sc.id}`}
                            className="sr-only"
                            checked={value === n}
                            onChange={() => setEv({ ratings: { ...ev.ratings, [sc.id]: n }, done: false })}
                          />
                          {n}
                        </label>
                      ))}
                    </div>
                    <span className="text-[13px] text-ink-3 sm:min-w-[150px]">{sc.high}</span>
                    <label
                      className={cx(
                        'inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-[13px] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-metro',
                        value === 'na' ? 'border-ink bg-ink text-white' : 'border-line text-ink-3 hover:text-ink',
                      )}
                    >
                      <input
                        type="radio"
                        name={`${person.id}-${sc.id}`}
                        className="sr-only"
                        checked={value === 'na'}
                        onChange={() => setEv({ ratings: { ...ev.ratings, [sc.id]: 'na' }, done: false })}
                      />
                      Not observed
                    </label>
                  </div>
                </fieldset>
              )
            })}
          </div>

          <div className="mt-8">
            <label htmlFor="notes" className="text-[17px] font-semibold text-ink">
              Notes <span className="font-normal text-ink-3">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={ev.notes}
              onChange={(e) => setEv({ notes: e.target.value, done: false })}
              className="mt-2 w-full resize-y rounded-[8px] border border-line-strong px-4 py-3 text-[16px] focus:border-sea focus:outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-ink-3">Ratings stay separate. Nothing is added up or compared.</p>
            <Button onClick={save} disabled={ev.done}>
              {ev.done ? (
                <>
                  <Check aria-hidden size={16} /> Saved
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
