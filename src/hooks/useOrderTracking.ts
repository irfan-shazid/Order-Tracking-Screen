import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../data/mockApi'
import type { Scenario } from '../lib/scenarios'
import type { Order, ReportIssueInput } from '../types/order'

export type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not_found'; query: string }
  | { status: 'ready'; order: Order }

const patchOrder =
  (patch: Partial<Order>) =>
  (state: LoadState): LoadState =>
    state.status === 'ready' ? { status: 'ready', order: { ...state.order, ...patch } } : state

export function useOrderTracking(scenario: Scenario) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [orderNumber, setOrderNumber] = useState(scenario.orderNumber)
  const [requestId, setRequestId] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const hasFailedOnce = useRef(false)

  useEffect(() => {
    let active = true
    const fail = Boolean(scenario.failFirstAttempt) && !hasFailedOnce.current
    const latencyMs = requestId === 0 ? scenario.latencyMs : undefined

    api
      .fetchOrder(orderNumber, { latencyMs, fail })
      .then((order) => {
        if (active) setState({ status: 'ready', order })
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof api.OrderNotFoundError) {
          setState({ status: 'not_found', query: orderNumber })
        } else {
          hasFailedOnce.current = true
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong',
          })
        }
      })

    return () => {
      active = false
    }
  }, [orderNumber, requestId, scenario.failFirstAttempt, scenario.latencyMs])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRequestId((id) => id + 1)
  }, [])

  const search = useCallback((query: string) => {
    setState({ status: 'loading' })
    setOrderNumber(api.normalizeOrderNumber(query))
    setRequestId((id) => id + 1)
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const order = await api.fetchOrder(orderNumber, { latencyMs: 800 })
      setState({ status: 'ready', order })
      return true
    } catch {
      return false
    } finally {
      setRefreshing(false)
    }
  }, [orderNumber])

  const applyUpdate = useCallback(async (request: Promise<Order>) => {
    const order = await request
    setState({ status: 'ready', order })
    return order
  }, [])

  const setAlerts = useCallback(
    async (enabled: boolean) => {
      setState(patchOrder({ alertsEnabled: enabled }))
      try {
        await applyUpdate(api.updateAlerts(orderNumber, enabled))
      } catch (error) {
        setState(patchOrder({ alertsEnabled: !enabled }))
        throw error
      }
    },
    [applyUpdate, orderNumber],
  )

  const confirmReceipt = useCallback(
    (receipt: 'confirmed' | 'not_received') => applyUpdate(api.confirmReceipt(orderNumber, receipt)),
    [applyUpdate, orderNumber],
  )

  const reportIssue = useCallback(
    (input: ReportIssueInput) => applyUpdate(api.reportIssue(orderNumber, input)),
    [applyUpdate, orderNumber],
  )

  return { state, refreshing, retry, search, refresh, setAlerts, confirmReceipt, reportIssue }
}

export type OrderTracking = ReturnType<typeof useOrderTracking>
