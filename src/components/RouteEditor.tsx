import { Plus, X } from 'lucide-react'
import type { Prescreen } from '../data/demo'
import { Button, cx } from './ui/primitives'

const inputCls =
  'h-10 rounded-[8px] border border-line-strong px-3 text-[15px] placeholder:text-ink-3 focus:border-sea focus:outline-none'

/** "Your route so far": past roles (grey rings) and self-directed learning (blue ring). */
export function RouteEditor({ p, set }: { p: Prescreen; set: (patch: Partial<Prescreen>) => void }) {
  return (
      <section aria-labelledby="route-title" >
        <h2 id="route-title" className="display text-[24px] font-semibold text-ink">
          Your route so far
        </h2>
        <p className="mt-1 text-[15px] text-ink-3">Any background counts, including things you learned on your own.</p>

        <ol className="mt-5 space-y-3">
          {p.roles.map((r, i) => (
            <li key={i} className="flex items-center gap-3">
              <span aria-hidden className="block size-4 shrink-0 rounded-full border-[4px] border-stone bg-white" />
              <label htmlFor={`role-${i}`} className="sr-only">
                Role {i + 1}
              </label>
              <input
                id={`role-${i}`}
                value={r.title}
                onChange={(e) => set({ roles: p.roles.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
                placeholder="Role, e.g. Front desk associate"
                className={cx(inputCls, 'min-w-0 flex-1')}
              />
              <label htmlFor={`years-${i}`} className="sr-only">
                Years for role {i + 1}
              </label>
              <input
                id={`years-${i}`}
                value={r.years}
                onChange={(e) => set({ roles: p.roles.map((x, j) => (j === i ? { ...x, years: e.target.value } : x)) })}
                placeholder="Years"
                className={cx(inputCls, 'w-24 shrink-0 sm:w-32')}
              />
              <button
                type="button"
                onClick={() => set({ roles: p.roles.filter((_, j) => j !== i) })}
                aria-label={`Remove role ${i + 1}`}
                disabled={p.roles.length === 1}
                className="grid size-10 shrink-0 place-items-center rounded-[8px] text-ink-3 hover:bg-mist-soft hover:text-ink disabled:opacity-30"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ol>
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => set({ roles: [...p.roles, { title: '', years: '' }] })}>
          <Plus aria-hidden size={15} /> Add a role
        </Button>

        <div className="mt-5 flex items-start gap-3">
          <span aria-hidden className="mt-3 block size-4 shrink-0 rounded-full border-[4px] border-sea bg-white" />
          <div className="flex-1">
            <label htmlFor="learning" className="text-[15px] font-semibold text-ink">
              Learning on your own
            </label>
            <textarea
              id="learning"
              rows={2}
              value={p.learning}
              onChange={(e) => set({ learning: e.target.value })}
              placeholder="Courses, projects, tools you've taught yourself"
              className="mt-1 w-full resize-y rounded-[8px] border border-line-strong px-3 py-2.5 text-[15px] placeholder:text-ink-3 focus:border-sea focus:outline-none"
            />
          </div>
        </div>
      </section>
  )
}
