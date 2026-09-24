import { useEffect, useRef } from 'react'
import { ScenarioBar, ScenarioPanel } from './components/demo/ScenarioPicker'
import { TrackingScreen } from './components/tracking/TrackingScreen'
import { ToastProvider } from './components/ui/ToastProvider'
import { useScenarioParam } from './hooks/useScenarioParam'
import { getScenario } from './lib/scenarios'

export default function App() {
  const [scenarioId, setScenarioId] = useScenarioParam()
  const scenario = getScenario(scenarioId)
  const scrollRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRootRef.current) scrollRootRef.current.scrollTop = 0
  }, [scenarioId])

  return (
    <div className="app-backdrop min-h-dvh lg:flex lg:items-center lg:justify-center lg:gap-16 lg:px-8 lg:py-8">
      <div className="hidden lg:block">
        <ScenarioPanel value={scenarioId} onChange={setScenarioId} />
      </div>
      <div className="lg:hidden">
        <ScenarioBar value={scenarioId} onChange={setScenarioId} />
      </div>

      <div className="device-frame">
        <ToastProvider>
          <div ref={scrollRootRef} data-scroll-root className="device-scroll">
            <TrackingScreen key={scenario.id} scenario={scenario} />
          </div>
        </ToastProvider>
      </div>
    </div>
  )
}
