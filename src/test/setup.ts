import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { configureMockApi, resetMockDb } from '../data/mockApi'

configureMockApi({ latencyScale: 0 })

beforeEach(() => {
  resetMockDb()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})
