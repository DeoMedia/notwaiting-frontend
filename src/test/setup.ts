import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Stub import.meta.env for tests (Vite-only feature)
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3001',
      },
    },
  },
  writable: true,
  configurable: true,
})
