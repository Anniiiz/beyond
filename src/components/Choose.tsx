import { useEffect, useState } from 'react'
import { Check, CircleDashed, CornerDownRight, Send, Sparkles, Undo2 } from 'lucide-react'
import {
  APPLICANTS,
  EXAMPLE_ANSWERS,
  EXAMPLE_PRESCREEN,
  PRETASK,
  SAMPLE_INVITES,
  YOU,
  type Applicant,
  type ReqStatus,
} from '../data/demo'
import { getSummary, summaryInput, summaryKey } from '../lib/summary'
import { useApp, type Decision } from '../state/app'
import { Avatar, Button, FillButton, StepHeader, cx } from './ui/primitives'

export interface Background {
  text: string | null
  source: 'ai' | 'fallback' | 'written'
  reqs: { name: string; status: ReqStatus; how?: string }[]
}

/** Recruiter view of the prescreen: a short background summary and how each requirement is met. */
function BackgroundCheck({ b }: { b: Background }) {
  return (
    <div className="mt-4 rounded-[10px] bg-mist-soft px-4 py-3.5 sm:ml-[60px]">
      <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink-3">
        Background check
        {b.source === 'ai' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sea-soft px-2 py-0.5 text-[12px] font-medium text-sea-deep">
            <Sparkles aria-hidden size={11} /> AI summary of their application
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-[15px] leading-relaxed text-ink" aria-live="polite">
        {b.text ?? <span className="text-ink-3">Summarising their background…</span>}
      </p>
      {b.reqs.length ? (
        <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]">
          {b.reqs.map((r) => (
            <li key={r.name} className="flex items-start gap-1.5">
              {r.status === 'have' ? (
                <Check aria-hidden size={15} className="mt-0.5 shrink-0 text-sea" />
              ) : r.status === 'other' ? (
                <CornerDownRight aria-hidden size={15} className="mt-0.5 shrink-0 text-sea" />
              ) : (
                <CircleDashed aria-hidden size={15} className="mt-0.5 shrink-0 text-ink-3" />
              )}
              <span className={r.status === 'not-yet' ? 'text-ink-3' : 'text-ink'}>
                {r.name}
                <span className="text-ink-3">
                  {r.status === 'other' ? `: another way${r.how ? `, ${r.how.charAt(0).toLowerCase()}${r.how.slice(1).replace(/\.$/, '')}` : ''}` : r.status === 'not-yet' ? ': not yet' : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Row({
  a,
  isNew,
  decision,
  onDecide,
  pretaskTitle,
  background,
}: {
  a: Applicant
  isNew: boolean
  decision?: Decision
  onDecide: (d: Decision | undefined) => void
  pretaskTitle: string
  background: Background
}) {
  const [open, setOpen] = useState(false)
  return (
    <li className={cx('py-6', decision === 'pass' && 'opacity-60')}>
      <div className="flex flex-wrap items-start gap-4">
        <Avatar initials={a.initials} size={44} muted={decision === 'pass'} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[17px] font-semibold text-ink">
            {a.name}
            {isNew ? <span className="rounded-full bg-metro px-2 py-0.5 text-[12px] font-bold text-ink">New</span> : null}
          </p>
          <p className="text-[14px] text-ink-3">
            {a.background}, {a.submitted.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {decision ? (
            <>
              <span
                className={cx(
                  'inline-flex h-9 items-center gap-1.5 rounded-[6px] px-3 text-[14px] font-semibold',
                  decision === 'invite' ? 'bg-sea text-white' : 'bg-stone-soft text-stone-deep',
                )}
              >
                {decision === 'invite' ? <Check aria-hidden size={15} /> : null}
                {decision === 'invite' ? 'Invited' : 'Not now'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onDecide(undefined)} aria-label={`Undo decision for ${a.name}`}>
                <Undo2 aria-hidden size={15} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onDecide('pass')} aria-label={`Not now: ${a.name}`}>
                Not now
              </Button>
              <Button size="sm" onClick={() => onDecide('invite')} aria-label={`Invite ${a.name}`}>
                Invite
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 pl-0 sm:pl-[60px] md:grid-cols-2 md:gap-8">
        <div>
          <p className="text-[13px] font-semibold text-ink-3">Why this job</p>
          <p className={cx('mt-1 text-[15.5px] leading-relaxed whitespace-pre-line text-ink', !open && 'line-clamp-2')}>{a.motivation}</p>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink-3">Pre-task: {pretaskTitle.toLowerCase()}</p>
          <p className={cx('mt-1 text-[15.5px] leading-relaxed text-ink', !open && 'line-clamp-2')}>{a.pretask}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 ml-0 rounded text-[14px] font-medium text-sea hover:underline sm:ml-[60px]"
      >
        {open ? 'Show less' : 'Read in full'}
      </button>
      <BackgroundCheck b={background} />
    </li>
  )
}

export function Choose() {
  const { state, update, go } = useApp()
  const you: Applicant = {
    ...YOU,
    submitted: 'Just now',
    motivation: state.motivation.trim() || EXAMPLE_ANSWERS.motivation,
    pretask: state.pretask.trim() || EXAMPLE_ANSWERS.pretask,
  }
  const appliedElsewhere = state.jobId !== null && state.jobId !== 'northstar'
  const list = appliedElsewhere ? APPLICANTS : [you, ...APPLICANTS]
  const role = state.posting.title || 'this role'
  const invited = list.filter((a) => state.decisions[a.id] === 'invite')

  const reqs = state.posting.qualifications
  const hasRoute = state.prescreen.roles.some((r) => r.title.trim()) || state.prescreen.learning.trim()
  // The route comes from the event application; fall back to Kimi's example when entered out of order.
  const route = hasRoute ? state.prescreen : { ...state.prescreen, ...EXAMPLE_PRESCREEN }
  // Only requirements the applicant actually answered are summarised (no assumptions about the rest).
  const input = summaryInput(role, reqs.filter((q) => route.answers[q]), route)
  const key = summaryKey(input)
  const summary = state.summary?.key === key ? state.summary : null
  useEffect(() => {
    if (appliedElsewhere || summary) return
    let alive = true
    void getSummary(input).then((s) => alive && update({ summary: s }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, appliedElsewhere])

  const backgroundFor = (a: Applicant): Background => {
    if (a.id === YOU.id) {
      return { text: summary?.text ?? null, source: summary?.source ?? 'ai', reqs: input.requirements }
    }
    return {
      text: a.summary ?? null,
      source: 'written',
      reqs: [],
    }
  }

  const decide = (id: string, d: Decision | undefined) =>
    update((s) => {
      const next = { ...s.decisions }
      if (d) next[id] = d
      else delete next[id]
      return { decisions: next }
    })


  return (
    <div>
      <StepHeader
        title="Choose who to meet"
        lede={`Applicants for ${role}. Read the answers, then invite.`}
        aside={
          <div className="flex items-center gap-3">
            <FillButton
              onClick={() =>
                update({
                  decisions: Object.fromEntries(
                    SAMPLE_INVITES.filter((id) => list.some((a) => a.id === id)).map((id) => [id, 'invite' as const]),
                  ),
                })
              }
            />
          </div>
        }
      />

      <ul className="divide-y divide-line border-y border-line">
        {list.map((a) => (
          <Row
            key={a.id}
            a={a}
            isNew={a.id === YOU.id}
            decision={state.decisions[a.id]}
            onDecide={(d) => decide(a.id, d)}
            pretaskTitle={state.posting.pretaskTitle.trim() || PRETASK.title}
            background={backgroundFor(a)}
          />
        ))}
      </ul>

      <div className="sticky bottom-0 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <p className="text-[15px] text-ink-2">
          {invited.length ? `${invited.length} invited` : 'No one invited yet'}
          <span className="text-ink-3">. Newest first, never ranked.</span>
        </p>
        <Button disabled={!invited.length} onClick={() => go('meet')}>
          <Send aria-hidden size={16} /> Send invitations
        </Button>
      </div>
    </div>
  )
}
