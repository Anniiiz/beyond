import { Fragment } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { AppProvider, STEPS, useApp, type Step } from './state/app'
import { Refine } from './components/Refine'
import { Apply } from './components/Apply'
import { Choose } from './components/Choose'
import { Programme } from './components/Programme'
import { Admit } from './components/Admit'
import { Meet } from './components/Meet'
import { cx } from './components/ui/primitives'

const SCREENS: Record<Step, () => React.JSX.Element> = { programme: Programme, admit: Admit, refine: Refine, apply: Apply, choose: Choose, meet: Meet }

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg aria-hidden width="40" height="24" viewBox="0 0 40 24">
        <path d="M2 12h12" stroke="var(--color-stone)" strokeWidth="5" strokeLinecap="round" />
        <path d="M26 12h12" stroke="var(--color-sea)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="20" cy="12" r="7.5" fill="#fff" stroke="var(--color-ink)" strokeWidth="4" />
      </svg>
      <span translate="no" className="display text-[22px] leading-none font-bold tracking-[-0.03em] text-ink">
        Beyond
      </span>
    </span>
  )
}

/** The three steps as a short transit line; the orange ring marks where you are. */
function StepLine() {
  const { state, go } = useApp()
  const current = STEPS.findIndex((s) => s.id === state.step)
  const groups = [
    { id: 'programme', label: 'Espoo event', steps: STEPS.filter((s) => s.group === 'programme') },
    { id: 'match', label: 'Matchmaking', steps: STEPS.filter((s) => s.group === 'match') },
  ]
  return (
    <nav aria-label="Steps" className="flex min-w-0 flex-1 items-start justify-center">
      {groups.map((g, gi) => (
        <Fragment key={g.id}>
        {gi > 0 ? (
          <span aria-hidden className="mt-[15px] h-0 w-6 shrink-0 border-t-[5px] border-dashed border-line-strong lg:w-10" />
        ) : null}
        <ol
          aria-label={g.label}
          className="grid min-w-0"
          style={{ gridTemplateColumns: `repeat(${g.steps.length}, minmax(0, 1fr))`, width: `min(100%, ${g.steps.length * 128}px)` }}
        >
          {g.steps.map((s, k) => {
            const i = STEPS.indexOf(s)
            const isCurrent = i === current
            const passed = i < current
            return (
              <li key={s.id} className="relative">
                {k > 0 ? (
                  <span aria-hidden className={cx('absolute top-[15px] left-0 h-[5px] w-1/2', i <= current ? 'bg-stone' : 'bg-sea')} />
                ) : gi > 0 ? (
                  <span aria-hidden className="absolute top-[15px] left-0 h-0 w-1/2 border-t-[5px] border-dashed border-line-strong" />
                ) : null}
                {k < g.steps.length - 1 ? (
                  <span aria-hidden className={cx('absolute top-[15px] right-0 h-[5px] w-1/2', i < current ? 'bg-stone' : 'bg-sea')} />
                ) : gi < groups.length - 1 ? (
                  <span aria-hidden className="absolute top-[15px] right-0 h-0 w-1/2 border-t-[5px] border-dashed border-line-strong" />
                ) : null}
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={s.label}
                  className="relative mx-auto flex w-full flex-col items-center rounded-[6px] pt-2 pb-1"
                >
                  <span className="relative grid size-5 place-items-center">
                    {isCurrent ? (
                      <motion.span
                        layoutId="you-are-here"
                        className="absolute -inset-[6px] rounded-full border-[4px] border-metro"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    ) : null}
                    <span
                      className={cx(
                        'block size-5 rounded-full border-[5px] bg-white',
                        passed ? 'border-stone' : isCurrent ? 'border-ink' : 'border-sea',
                      )}
                    />
                  </span>
                  <span
                    className={cx(
                      'mt-1.5 text-[13px] leading-tight whitespace-nowrap',
                      isCurrent ? 'hidden md:block' : 'hidden xl:block',
                      isCurrent ? 'font-bold text-ink' : passed ? 'text-stone-deep' : 'font-medium text-sea-deep',
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        </Fragment>
      ))}
    </nav>
  )
}

function Shell() {
  const { state, reset } = useApp()
  const Screen = SCREENS[state.step]
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-4 px-4 sm:px-8">
          <button type="button" onClick={reset} aria-label="Beyond, start over" className="shrink-0 rounded-[6px]">
            <Logo />
          </button>
          <StepLine />
          <button
            type="button"
            onClick={reset}
            className="hidden shrink-0 items-center gap-1.5 rounded-[6px] px-2 py-1.5 text-[13px] font-medium text-ink-3 hover:text-ink sm:inline-flex"
          >
            <RotateCcw aria-hidden size={14} /> Start over
          </button>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 pb-20 sm:px-8 lg:pt-14">
        <div key={state.step} className="stage-enter">
          <Screen />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <Shell />
      </AppProvider>
    </MotionConfig>
  )
}
