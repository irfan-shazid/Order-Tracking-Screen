import { FlaskConical } from 'lucide-react'
import { SCENARIOS, SCENARIO_GROUPS, type ScenarioId } from '../../lib/scenarios'
import { cn } from '../../lib/ui'

interface PickerProps {
  value: ScenarioId
  onChange: (id: ScenarioId) => void
}

export function ScenarioPanel({ value, onChange }: PickerProps) {
  return (
    <aside
      className="-mx-2 max-h-[calc(100dvh-4rem)] w-[360px] shrink-0 [scrollbar-width:thin] overflow-y-auto px-2 py-1"
      aria-label="Prototype scenarios"
    >
      <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
        <FlaskConical className="size-3.5" aria-hidden />
        Interactive prototype · mock data
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Order tracking, redesigned</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        One screen that adapts to every delivery situation. Pick a scenario to see how the status, timeline and next
        steps change. Everything on the phone is clickable.
      </p>

      <div className="mt-6 space-y-4">
        {SCENARIO_GROUPS.map((group) => (
          <fieldset key={group}>
            <legend className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">{group}</legend>
            <div className="space-y-1">
              {SCENARIOS.filter((s) => s.group === group).map((scenario) => {
                const selected = scenario.id === value
                return (
                  <label
                    key={scenario.id}
                    className={cn(
                      'relative block cursor-pointer rounded-xl px-3 py-2 ring-1 transition-colors',
                      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                      selected ? 'bg-white shadow-sm ring-brand-300' : 'ring-transparent hover:bg-white/70',
                    )}
                  >
                    <input
                      type="radio"
                      name="scenario"
                      value={scenario.id}
                      checked={selected}
                      onChange={() => onChange(scenario.id)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn('size-2 rounded-full', selected ? 'bg-brand-600' : 'bg-slate-300')}
                      />
                      <span className={cn('text-sm font-semibold', selected ? 'text-slate-900' : 'text-slate-700')}>
                        {scenario.label}
                      </span>
                    </span>
                    {selected && (
                      <span className="mt-0.5 block pl-4 text-[13px] leading-snug text-slate-500">
                        {scenario.description}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Dates are generated relative to today. Tip: each scenario has its own URL, e.g.{' '}
        <code className="rounded bg-white px-1 py-0.5 text-slate-700">?scenario=delayed</code>
      </p>
    </aside>
  )
}

export function ScenarioBar({ value, onChange }: PickerProps) {
  return (
    <div className="bg-slate-900 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-[430px] items-center gap-3">
        <label
          htmlFor="scenario-select"
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-300"
        >
          <FlaskConical className="size-3.5" aria-hidden />
          Demo
        </label>
        <select
          id="scenario-select"
          value={value}
          onChange={(e) => onChange(e.target.value as ScenarioId)}
          className="h-9 min-w-0 flex-1 rounded-lg bg-slate-800 px-2.5 text-base font-medium text-white ring-1 ring-slate-700 focus:ring-2 focus:ring-brand-400 focus:outline-none"
        >
          {SCENARIO_GROUPS.map((group) => (
            <optgroup key={group} label={group}>
              {SCENARIOS.filter((s) => s.group === group).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  )
}
