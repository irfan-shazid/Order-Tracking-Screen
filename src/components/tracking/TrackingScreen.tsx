import { useEffect, useMemo, useRef, useState } from 'react'
import { useNow } from '../../hooks/useNow'
import { useOrderTracking } from '../../hooks/useOrderTracking'
import { useToast } from '../../hooks/useToast'
import type { Scenario } from '../../lib/scenarios'
import { summarizeTracking, type TrackingSummary } from '../../lib/tracking'
import { copyToClipboard } from '../../lib/ui'
import type { IssueType, Order, ReportIssueInput } from '../../types/order'
import { DeliveryPhotoSheet } from '../sheets/DeliveryPhotoSheet'
import { OrderDetailsSheet } from '../sheets/OrderDetailsSheet'
import { ReportIssueSheet } from '../sheets/ReportIssueSheet'
import { SupportSheet, type SupportView } from '../sheets/SupportSheet'
import { ErrorState } from '../states/ErrorState'
import { LoadingState } from '../states/LoadingState'
import { NotFoundState } from '../states/NotFoundState'
import { AppBar } from './AppBar'
import { DeliveryDetailsCard } from './DeliveryDetailsCard'
import { HelpCard } from './HelpCard'
import { OrderSummaryCard } from './OrderSummaryCard'
import { AlertsCard } from './situations/AlertsCard'
import { DelayCard } from './situations/DelayCard'
import { DeliveredCard } from './situations/DeliveredCard'
import { InvestigationCard } from './situations/InvestigationCard'
import { NotReceivedCard } from './situations/NotReceivedCard'
import { OpenCaseCard } from './situations/OpenCaseCard'
import { TrackingPendingCard } from './situations/TrackingPendingCard'
import { StatusHero } from './StatusHero'
import { TrackingHistory } from './TrackingHistory'

const SHEET_EXIT_MS = 250

type SheetKind = 'details' | 'support' | 'report' | 'photo'
type Receipt = 'confirmed' | 'not_received'

const ALERT_ON_MESSAGE: Partial<Record<TrackingSummary['situation'], string>> = {
  preparing: "We'll text you when it ships",
  delayed: "We'll text you as soon as it moves",
  out_for_delivery: "We'll text you when the driver is close",
}

export function TrackingScreen({ scenario }: { scenario: Scenario }) {
  const tracking = useOrderTracking(scenario)
  const { state } = tracking
  const toast = useToast()
  const now = useNow()

  const [sheet, setSheet] = useState<SheetKind | null>(null)
  const [supportView, setSupportView] = useState<SupportView>('menu')
  const [reportPreset, setReportPreset] = useState<IssueType | undefined>()
  const [pendingReceipt, setPendingReceipt] = useState<Receipt | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusStatusOnClose = useRef(false)

  const order = state.status === 'ready' ? state.order : null
  const summary = useMemo(() => (order ? summarizeTracking(order, now) : null), [order, now])

  useEffect(() => {
    document.title = order && summary ? `${summary.headline} · Order #${order.number}` : 'Track your order'
  }, [order, summary])

  const focusStatus = () => requestAnimationFrame(() => headingRef.current?.focus())

  const openSupport = (view: SupportView = 'menu') => {
    setSupportView(view)
    setSheet('support')
  }
  const openReport = (preset?: IssueType) => {
    setReportPreset(preset)
    setSheet('report')
  }
  const closeSheet = () => {
    setSheet(null)
    if (focusStatusOnClose.current) {
      focusStatusOnClose.current = false
      setTimeout(focusStatus, SHEET_EXIT_MS)
    }
  }

  async function handleToggleAlerts(enabled: boolean) {
    try {
      await tracking.setAlerts(enabled)
      if (enabled) toast((summary && ALERT_ON_MESSAGE[summary.situation]) ?? 'Delivery alerts are on', 'success')
      else toast('Alerts turned off')
    } catch {
      toast("Couldn't update alerts. Please try again.", 'error')
    }
  }

  async function handleReceipt(receipt: Receipt) {
    const hadOpenCase = order?.supportCase?.status === 'open'
    setPendingReceipt(receipt)
    try {
      await tracking.confirmReceipt(receipt)
      if (receipt === 'confirmed') {
        toast(hadOpenCase ? "Glad it turned up! We've closed your case." : 'Thanks for confirming!', 'success')
      }
      focusStatus()
    } catch {
      toast('Something went wrong. Please try again.', 'error')
    } finally {
      setPendingReceipt(null)
    }
  }

  async function handleReport(input: ReportIssueInput): Promise<Order> {
    const updated = await tracking.reportIssue(input)
    focusStatusOnClose.current = true
    return updated
  }

  async function handleRefresh() {
    const ok = await tracking.refresh()
    toast(ok ? 'Tracking is up to date' : "Couldn't refresh. Check your connection.", ok ? 'success' : 'error')
  }

  async function handleCopy(value: string, label = 'Tracking number') {
    const ok = await copyToClipboard(value)
    toast(ok ? `${label} copied` : `Couldn't copy. ${label}: ${value}`, ok ? 'success' : 'error')
    return ok
  }

  function renderSituationCard(order: Order, summary: TrackingSummary) {
    const hasOpenCase = order.supportCase?.status === 'open'
    switch (summary.situation) {
      case 'preparing':
        return <TrackingPendingCard order={order} now={now} onToggleAlerts={handleToggleAlerts} />
      case 'in_transit':
      case 'out_for_delivery':
        return <AlertsCard order={order} onToggleAlerts={handleToggleAlerts} />
      case 'delayed':
        return (
          <DelayCard
            order={order}
            now={now}
            hasOpenCase={hasOpenCase}
            onToggleAlerts={handleToggleAlerts}
            onChat={() => openSupport('chat')}
            onReport={() => openReport('late')}
          />
        )
      case 'delivered':
        return (
          <DeliveredCard
            order={order}
            now={now}
            pending={pendingReceipt}
            onConfirm={handleReceipt}
            onViewPhoto={() => setSheet('photo')}
            onReport={() => openReport()}
          />
        )
      case 'not_received':
        return (
          <NotReceivedCard
            order={order}
            now={now}
            pending={pendingReceipt === 'confirmed'}
            onReport={() => openReport('not_received')}
            onFound={() => handleReceipt('confirmed')}
            onViewPhoto={() => setSheet('photo')}
          />
        )
      case 'investigating':
        return (
          <InvestigationCard
            order={order}
            supportCase={order.supportCase!}
            now={now}
            pending={pendingReceipt === 'confirmed'}
            onChat={() => openSupport('chat')}
            onFound={() => handleReceipt('confirmed')}
          />
        )
    }
  }

  const otherOpenCase =
    order?.supportCase?.status === 'open' && order.supportCase.type !== 'not_received' ? order.supportCase : null

  return (
    <div className="flex min-h-full flex-col">
      <AppBar orderNumber={order?.number} loading={state.status === 'loading'} onHelp={() => openSupport()} />

      <main className="flex-1 space-y-3 px-4 pt-4 pb-10" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState onRetry={tracking.retry} onContactSupport={() => openSupport()} />}
        {state.status === 'not_found' && <NotFoundState query={state.query} onSearch={tracking.search} />}

        {order && summary && (
          <div className="animate-fade-in space-y-3">
            <StatusHero
              summary={summary}
              lastSyncedAt={order.lastSyncedAt}
              now={now}
              refreshing={tracking.refreshing}
              onRefresh={handleRefresh}
              headingRef={headingRef}
            />
            {otherOpenCase && <OpenCaseCard supportCase={otherOpenCase} onChat={() => openSupport('chat')} />}
            {renderSituationCard(order, summary)}
            <TrackingHistory order={order} tone={summary.tone} now={now} />
            <DeliveryDetailsCard order={order} onCopyTracking={(value) => handleCopy(value)} />
            <OrderSummaryCard order={order} onViewDetails={() => setSheet('details')} />
            <HelpCard
              delivered={order.stage === 'delivered'}
              onContact={() => openSupport()}
              onReport={() => openReport()}
            />
          </div>
        )}
      </main>

      <SupportSheet
        open={sheet === 'support'}
        onClose={closeSheet}
        initialView={supportView}
        order={order}
        summary={summary}
        now={now}
        onReport={order ? () => openReport() : undefined}
      />
      {order && (
        <>
          <OrderDetailsSheet
            open={sheet === 'details'}
            onClose={closeSheet}
            order={order}
            now={now}
            onCopy={handleCopy}
          />
          <ReportIssueSheet
            open={sheet === 'report'}
            onClose={closeSheet}
            order={order}
            now={now}
            preset={reportPreset}
            onSubmit={handleReport}
          />
          <DeliveryPhotoSheet
            open={sheet === 'photo'}
            onClose={closeSheet}
            order={order}
            now={now}
            onNotMine={() => openReport('not_received')}
          />
        </>
      )}
    </div>
  )
}
