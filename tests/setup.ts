import { afterAll, afterEach, beforeAll, vi } from 'vitest'

beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})
