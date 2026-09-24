import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Clock,
  PackageSearch,
  PackageX,
  Replace,
  RotateCcw,
  Shuffle,
  MessageSquareText,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { formatDayAndTime, formatDayAndTimePhrase, formatMoney, formatShortDate } from '../../lib/format'
import { cn } from '../../lib/ui'
import type { IssueType, Order, ReportIssueInput, Resolution, SupportCase } from '../../types/order'
import { Button, IconButton } from '../ui/Button'
import { Sheet, SheetBody, SheetFooter, SheetHeader } from '../ui/Sheet'

interface IssueOption {
  type: IssueType
  label: string
  title: string
  description: string
  icon: LucideIcon
  availableWhen: 'delivered' | 'in_progress' | 'always'
}

const ISSUE_OPTIONS: IssueOption[] = [
  {
    type: 'not_received',
    label: "It says delivered, but I don't have it",
    title: 'Package not received',
    description: "We'll investigate with the carrier",
    icon: PackageSearch,
    availableWhen: 'delivered',
  },
  {
    type: 'damaged',
    label: 'An item arrived damaged',
    title: 'Damaged item',
    description: 'Broken, dented or not working',
    icon: PackageX,
    availableWhen: 'delivered',
  },
  {
    type: 'wrong_item',
    label: 'Wrong or missing item',
    title: 'Wrong or missing item',
    description: "Something isn't what you ordered",
    icon: Shuffle,
    availableWhen: 'delivered',
  },
  {
    type: 'late',
    label: 'My package is late',
    title: 'Late package',
    description: "It hasn't arrived when expected",
    icon: Clock,
    availableWhen: 'in_progress',
  },
  {
    type: 'other',
    label: 'Something else',
    title: 'Something else',
    description: 'Tell us in your own words',
    icon: MessageSquareText,
    availableWhen: 'always',
  },
]

const NEEDS_RESOLUTION: IssueType[] = ['not_received', 'damaged', 'wrong_item', 'late']
const NEEDS_DETAILS: IssueType[] = ['damaged', 'wrong_item', 'other']
const MIN_DETAILS = 10

function issueOptionsFor(order: Order) {
  const delivered = order.stage === 'delivered'
  return ISSUE_OPTIONS.filter((o) => o.availableWhen === 'always' || (o.availableWhen === 'delivered') === delivered)
}

interface ReportIssueSheetProps {
  open: boolean
  onClose: () => void
  order: Order
  now: Date
  preset?: IssueType
  onSubmit: (input: ReportIssueInput) => Promise<Order>
}

export function ReportIssueSheet({ open, onClose, ...rest }: ReportIssueSheetProps) {
  return (
    <Sheet open={open} onClose={onClose}>
      <ReportFlow onClose={onClose} {...rest} />
    </Sheet>
  )
}

type Step = 'type' | 'details' | 'done'

function ReportFlow({ onClose, order, now, preset, onSubmit }: Omit<ReportIssueSheetProps, 'open'>) {
  const options = issueOptionsFor(order)
  const validPreset = preset && options.some((o) => o.type === preset) ? preset : undefined
  const [step, setStep] = useState<Step>(validPreset ? 'details' : 'type')
  const [type, setType] = useState<IssueType | undefined>(validPreset)
  const [resolution, setResolution] = useState<Resolution>('replacement')
  const [details, setDetails] = useState('')
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdCase, setCreatedCase] = useState<SupportCase | null>(null)
  const detailsId = useId()
  const formId = useId()

  const focusTarget = useRef<HTMLElement | null>(null)
  const setFocusTarget = (el: HTMLElement | null) => {
    focusTarget.current = el
  }
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    focusTarget.current?.focus()
  }, [step])

  const option = options.find((o) => o.type === type)
  const needsResolution = type ? NEEDS_RESOLUTION.includes(type) : false
  const needsDetails = type ? NEEDS_DETAILS.includes(type) : false

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!type || submitting) return
    if (needsDetails && details.trim().length < MIN_DETAILS) {
      setDetailsError(`Please add a few words (at least ${MIN_DETAILS} characters) so we can help.`)
      document.getElementById(detailsId)?.focus()
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await onSubmit({ type, resolution: needsResolution ? resolution : undefined, details })
      setCreatedCase(updated.supportCase ?? null)
      setStep('done')
    } catch {
      setSubmitError("We couldn't send your report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'type') {
    return (
      <>
        <SheetHeader title="Report a problem" description={`Order #${order.number}`} />
        <SheetBody>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-900">What went wrong?</legend>
            <div className="space-y-2">
              {options.map((o, index) => (
                <label
                  key={o.type}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 transition-colors',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                    type === o.type ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
                  )}
                >
                  <input
                    ref={index === 0 ? setFocusTarget : undefined}
                    type="radio"
                    name="issue-type"
                    value={o.type}
                    checked={type === o.type}
                    onChange={() => setType(o.type)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      type === o.type ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600',
                    )}
                    aria-hidden
                  >
                    <o.icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{o.label}</span>
                    <span className="block text-[13px] text-slate-500">{o.description}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                      type === o.type ? 'border-brand-600' : 'border-slate-300',
                    )}
                  >
                    {type === o.type && <span className="size-2.5 rounded-full bg-brand-600" />}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </SheetBody>
        <SheetFooter>
          <Button block size="lg" disabled={!type} onClick={() => setStep('details')}>
            Continue
          </Button>
        </SheetFooter>
      </>
    )
  }

  if (step === 'done' && createdCase && type) {
    const outcome = createdCase.resolution === 'refund' ? 'refund' : 'replacement'
    const nextSteps: Record<IssueType, string[]> = {
      not_received: [
        `We're asking ${order.shipment?.carrier ?? 'the carrier'} to check the GPS scan and driver notes.`,
        `If it hasn't turned up by ${formatShortDate(createdCase.respondBy)}, your ${outcome} goes out automatically.`,
      ],
      late: [
        `We've asked ${order.shipment?.carrier ?? 'the carrier'} for an urgent update on your package.`,
        `We'll confirm your ${outcome} options by ${formatShortDate(createdCase.respondBy)}.`,
      ],
      damaged: [
        'No need to send anything back yet.',
        `We'll confirm your ${outcome} by ${formatShortDate(createdCase.respondBy)}.`,
      ],
      wrong_item: [
        'Keep the item you received for now.',
        `We'll confirm your ${outcome} by ${formatShortDate(createdCase.respondBy)}.`,
      ],
      other: [
        'A specialist will review your message.',
        `Expect a reply by ${formatDayAndTime(createdCase.respondBy, now)}.`,
      ],
    }

    return (
      <>
        <SheetHeader title="Report submitted" description={`Order #${order.number}`} />
        <SheetBody>
          <div className="flex flex-col items-center pt-2 text-center" role="status">
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CircleCheck className="size-9" aria-hidden />
            </span>
            <p className="mt-4 text-lg font-semibold text-slate-900">We've got it from here</p>
            <p className="mt-1 text-sm text-slate-600">
              Your case number is <strong className="font-semibold text-slate-900">#{createdCase.id}</strong>
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">What happens next</h3>
            <ol className="mt-3 space-y-3">
              {[...nextSteps[type], `We'll email updates to ${order.customer.email}.`].map((text, index) => (
                <li key={text} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-brand-700 ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </SheetBody>
        <SheetFooter>
          <Button block size="lg" onClick={onClose} ref={setFocusTarget}>
            Done
          </Button>
        </SheetFooter>
      </>
    )
  }

  const delivery = order.delivery
  return (
    <>
      <SheetHeader
        title={option?.title ?? 'Report a problem'}
        description={`Order #${order.number}`}
        leading={
          <IconButton label="Choose a different problem" onClick={() => setStep('type')} ref={setFocusTarget}>
            <ArrowLeft className="size-5" aria-hidden />
          </IconButton>
        }
      />
      <SheetBody>
        <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
          {type === 'not_received' && delivery && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
              {order.shipment?.carrier ?? 'The carrier'} marked this delivered{' '}
              {formatDayAndTimePhrase(delivery.deliveredAt, now)} ({delivery.location.toLowerCase()}). We'll ask them to
              investigate.
            </p>
          )}

          {needsResolution && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-900">
                {type === 'late' ? "If it doesn't show up, what would you prefer?" : 'How should we make it right?'}
              </legend>
              <div className="grid gap-2">
                <ResolutionOption
                  value="replacement"
                  checked={resolution === 'replacement'}
                  onSelect={setResolution}
                  icon={Replace}
                  title="Send a replacement"
                  description="Ships free with priority delivery"
                />
                <ResolutionOption
                  value="refund"
                  checked={resolution === 'refund'}
                  onSelect={setResolution}
                  icon={RotateCcw}
                  title={`Refund ${formatMoney(order.pricing.total, order.currency)}`}
                  description={`To ${order.payment.brand} •••• ${order.payment.last4} in 3–5 business days`}
                />
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor={detailsId} className="text-sm font-semibold text-slate-900">
              {needsDetails ? 'Tell us what happened' : 'Anything else we should know?'}
              {!needsDetails && <span className="font-normal text-slate-500"> (optional)</span>}
            </label>
            <textarea
              id={detailsId}
              value={details}
              onChange={(e) => {
                setDetails(e.target.value)
                if (detailsError && e.target.value.trim().length >= MIN_DETAILS) setDetailsError(null)
              }}
              rows={4}
              maxLength={500}
              aria-invalid={detailsError ? true : undefined}
              aria-describedby={detailsError ? `${detailsId}-error` : `${detailsId}-hint`}
              placeholder={
                type === 'not_received'
                  ? 'e.g. I checked with neighbors and the mail room'
                  : type === 'damaged'
                    ? 'e.g. The lamp base is cracked and it won’t turn on'
                    : 'Describe the problem'
              }
              className={cn(
                'mt-1.5 block w-full resize-none rounded-xl bg-white px-3 py-2.5 text-base text-slate-900 ring-1 placeholder:text-slate-400 focus:ring-2 focus:outline-none',
                detailsError ? 'ring-rose-400 focus:ring-rose-500' : 'ring-slate-300 focus:ring-brand-500',
              )}
            />
            {detailsError ? (
              <p id={`${detailsId}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-rose-600">
                <CircleAlert className="size-4 shrink-0" aria-hidden />
                {detailsError}
              </p>
            ) : (
              <p id={`${detailsId}-hint`} className="mt-1.5 text-right text-xs text-slate-500">
                {details.length}/500
              </p>
            )}
          </div>

          {submitError && (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              <CircleAlert className="size-4 shrink-0" aria-hidden />
              {submitError}
            </p>
          )}
        </form>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" form={formId} block size="lg" loading={submitting}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </Button>
      </SheetFooter>
    </>
  )
}

function ResolutionOption({
  value,
  checked,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  value: Resolution
  checked: boolean
  onSelect: (value: Resolution) => void
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 transition-colors',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
        checked ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
      )}
    >
      <input
        type="radio"
        name="resolution"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <Icon className={cn('size-5 shrink-0', checked ? 'text-brand-600' : 'text-slate-500')} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-[13px] text-slate-500">{description}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
          checked ? 'border-brand-600' : 'border-slate-300',
        )}
      >
        {checked && <span className="size-2.5 rounded-full bg-brand-600" />}
      </span>
    </label>
  )
}
