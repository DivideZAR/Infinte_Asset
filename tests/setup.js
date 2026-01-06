import { jest, beforeAll, afterAll } from '@jest/globals'

beforeAll(() => {
  jest.setTimeout(30000)
})

afterAll(() => {
  jest.clearAllMocks()
})

globalThis.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
