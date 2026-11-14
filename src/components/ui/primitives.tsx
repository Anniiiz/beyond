import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { FlaskConical, Sparkles, Wand2 } from 'lucide-react'

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'secondary' | 'ghost'
const variants: Record<Variant, string> = {
  primary: 'bg-sea text-white hover:bg-sea-deep disabled:bg-line disabled:text-ink-3',
  secondary: 'border-2 border-sea text-sea hover:bg-sea-soft disabled:border-line disabled:text-ink-3',
  ghost: 'text-ink-2 hover:bg-mist-soft hover:text-ink disabled:text-ink-3',
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }
>(function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] font-semibold whitespace-nowrap transition-colors duration-150',
        size === 'sm' ? 'h-9 px-3 text-[14px]' : 'h-11 px-5 text-[15px]',
        variants[variant],
        className,
      )}
      {...rest}
    />
  )
})

export function AiTag({ label = 'Simulated AI' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sea-soft px-2 py-0.5 text-[12px] font-medium text-sea-deep">
      <Sparkles aria-hidden size={12} />
      {label}
    </span>
  )
}

export function FictionalTag({ label = 'Fictional' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-soft px-2 py-0.5 text-[12px] font-medium text-stone-deep">
      <FlaskConical aria-hidden size={12} />
      {label}
    </span>
  )
}

export function Avatar({ initials, size = 40, muted }: { initials: string; size?: number; muted?: boolean }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold',
        muted ? 'bg-stone-soft text-stone-deep' : 'bg-sea-soft text-sea-deep',
      )}
    >
      {initials}
    </span>
  )
}

/** Demo helper: fills the current step with fictional sample input. */
export function FillButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Wand2 aria-hidden size={14} /> Fill automatically
    </Button>
  )
}

/** Step header: one headline, one short line. */
export function StepHeader({ title, lede, aside }: { title: string; lede?: string; aside?: ReactNode }) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-[34px] leading-[1.1] font-semibold text-ink sm:text-[42px]">{title}</h1>
        {lede ? <p className="mt-2 text-[18px] text-ink-3">{lede}</p> : null}
      </div>
      {aside}
    </header>
  )
}
