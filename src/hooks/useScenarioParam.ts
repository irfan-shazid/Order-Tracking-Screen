import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SCENARIO_ID, isScenarioId, type ScenarioId } from '../lib/scenarios'

const PARAM = 'scenario'

function readFromUrl(): ScenarioId {
  const value = new URLSearchParams(window.location.search).get(PARAM)
  return isScenarioId(value) ? value : DEFAULT_SCENARIO_ID
}

export function useScenarioParam() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(readFromUrl)

  useEffect(() => {
    const onPopState = () => setScenarioId(readFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const selectScenario = useCallback((id: ScenarioId) => {
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM, id)
    window.history.pushState(null, '', url)
    setScenarioId(id)
  }, [])

  return [scenarioId, selectScenario] as const
}
