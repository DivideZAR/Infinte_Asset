import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import {
  createTimingState,
  advanceFrame,
  getDateNowOverride,
  getSetTimeoutOverride,
  getSetIntervalOverride,
  getClearIntervalOverride,
  triggerDueIntervals,
  getRAFOverride,
  getCancelRAFOverride,
  createTimingOverrides,
} from '../scripts/utils/timing.js'

describe('FrameTimeManager', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockWindow: any

  beforeEach(() => {
    mockWindow = {
      setTimeout: (cb: () => void, delay: number) => setTimeout(cb, delay),
      setInterval: (cb: () => void, delay: number) => setInterval(cb, delay),
    }
  })

  describe('createTimingState', () => {
    it('should create timing state with initial values', () => {
      const baseTime = 1000
      const state = createTimingState(baseTime)

      expect(state.frameTimeBase).toBe(baseTime)
      expect(state.frameProgress).toBe(0)
      expect(state.advancedTime).toBe(baseTime)
      expect(state.intervalData).toBeInstanceOf(Map)
      expect(state.nextIntervalId).toBe(0)
    })
  })

  describe('advanceFrame', () => {
    it('should advance frame progress by msPerFrame', () => {
      const state = createTimingState(1000)

      const advancedTime = advanceFrame(state, 33)

      expect(state.frameProgress).toBe(33)
      expect(advancedTime).toBe(1033)
    })

    it('should accumulate frame progress across multiple frames', () => {
      const state = createTimingState(1000)

      advanceFrame(state, 33)
      advanceFrame(state, 33)
      advanceFrame(state, 34)

      expect(state.frameProgress).toBe(100)
      expect(state.advancedTime).toBe(1100)
    })
  })

  describe('getDateNowOverride', () => {
    it('should return the advanced time', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 500)

      const dateNowOverride = getDateNowOverride(state)
      expect(dateNowOverride()).toBe(1500)
    })

    it('should return consistent values across multiple calls', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 100)

      const dateNowOverride = getDateNowOverride(state)

      expect(dateNowOverride()).toBe(1100)
      expect(dateNowOverride()).toBe(1100)
      expect(dateNowOverride()).toBe(1100)
    })
  })

  describe('getSetTimeoutOverride', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.window = mockWindow as any
    })

    afterEach(() => {
      delete (global as any).window
    })

    it('should create setTimeout override function', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 100)

      const setTimeoutOverride = getSetTimeoutOverride(state)
      expect(typeof setTimeoutOverride).toBe('function')
    })
  })

  describe('getSetIntervalOverride', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.window = mockWindow as any
    })

    afterEach(() => {
      delete (global as any).window
    })

    it('should create setInterval override function', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 100)

      const setIntervalOverride = getSetIntervalOverride(state)
      expect(typeof setIntervalOverride).toBe('function')
    })

    it('should track intervals in intervalData', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 100)

      const setIntervalOverride = getSetIntervalOverride(state)
      const mockCallback = jest.fn()

      setIntervalOverride(mockCallback, 100)

      expect(state.intervalData.size).toBe(1)
      expect(state.nextIntervalId).toBe(1)
    })
  })

  describe('getClearIntervalOverride', () => {
    it('should create clearInterval override function', () => {
      const state = createTimingState(1000)

      const clearIntervalOverride = getClearIntervalOverride(state)
      expect(typeof clearIntervalOverride).toBe('function')
    })

    it('should remove interval from intervalData', () => {
      const state = createTimingState(1000)

      // Add an interval
      state.intervalData.set(1, {
        cb: jest.fn(),
        targetTime: 2000,
        delay: 100,
      })

      const clearIntervalOverride = getClearIntervalOverride(state)
      clearIntervalOverride(1)

      expect(state.intervalData.has(1)).toBe(false)
    })
  })

  describe('triggerDueIntervals', () => {
    it('should trigger intervals that have reached their target time', () => {
      const state = createTimingState(1000)
      const mockCallback = jest.fn()

      state.intervalData.set(1, {
        cb: mockCallback,
        targetTime: 1050, // Due at 1050ms
        delay: 100,
      })

      advanceFrame(state, 100) // Advanced to 1100ms

      triggerDueIntervals(state)

      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    it('should not trigger intervals not yet due', () => {
      const state = createTimingState(1000)
      const mockCallback = jest.fn()

      state.intervalData.set(1, {
        cb: mockCallback,
        targetTime: 2000, // Not due yet
        delay: 100,
      })

      advanceFrame(state, 100) // Advanced to 1100ms

      triggerDueIntervals(state)

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should reschedule interval after triggering', () => {
      const state = createTimingState(1000)
      const mockCallback = jest.fn()

      // Initialize advanced time
      advanceFrame(state, 0)

      // Add interval due at 1050
      state.intervalData.set(1, {
        cb: mockCallback,
        targetTime: 1050,
        delay: 100,
      })

      // Advance to 1050
      advanceFrame(state, 50)
      triggerDueIntervals(state)

      // Should be rescheduled for next interval (1050 + 100)
      const interval = state.intervalData.get(1)
      expect(interval?.targetTime).toBe(1150)
    })
  })

  describe('getRAFOverride', () => {
    it('should create requestAnimationFrame override function', () => {
      const state = createTimingState(1000)

      const rafOverride = getRAFOverride(state)
      expect(typeof rafOverride).toBe('function')
    })

    it('should call callback with advancedTime', () => {
      const state = createTimingState(1000)
      advanceFrame(state, 500)

      const rafOverride = getRAFOverride(state)
      const mockCallback = jest.fn()

      rafOverride(mockCallback)

      expect(mockCallback).toHaveBeenCalledWith(1500)
    })
  })

  describe('getCancelRAFOverride', () => {
    it('should return a no-op function', () => {
      const cancelOverride = getCancelRAFOverride()

      // Should not throw
      expect(() => cancelOverride(0)).not.toThrow()
      expect(() => cancelOverride(999)).not.toThrow()
    })
  })

  describe('createTimingOverrides', () => {
    it('should create timing overrides with all methods', () => {
      const overrides = createTimingOverrides({ fps: 30, duration: 5 })

      expect(typeof overrides.init).toBe('function')
      expect(typeof overrides.advanceFrame).toBe('function')
      expect(typeof overrides.getAdvancedTime).toBe('function')
      expect(typeof overrides.getDateNowOverride).toBe('function')
      expect(typeof overrides.getSetTimeoutOverride).toBe('function')
      expect(typeof overrides.getSetIntervalOverride).toBe('function')
      expect(typeof overrides.getClearIntervalOverride).toBe('function')
      expect(typeof overrides.triggerDueIntervals).toBe('function')
      expect(typeof overrides.getRAFOverride).toBe('function')
      expect(typeof overrides.getCancelRAFOverride).toBe('function')
    })

    it('should initialize state with current time', () => {
      const now = Date.now()
      const overrides = createTimingOverrides({ fps: 30, duration: 5 })

      overrides.init()

      const state = overrides.getState()
      expect(state.frameTimeBase).toBeGreaterThanOrEqual(now)
    })

    it('should advance time correctly across multiple frames', () => {
      const overrides = createTimingOverrides({ fps: 30, duration: 5 })

      overrides.init()

      const frame1 = overrides.advanceFrame(33)
      const frame2 = overrides.advanceFrame(33)
      const frame3 = overrides.advanceFrame(34)

      // Each frame should advance by the correct amount
      expect(frame2 - frame1).toBe(33)
      expect(frame3 - frame2).toBe(34)
      // Total accumulated progress is 33+33+34 = 100ms
      // getAdvancedTime() returns frameTimeBase + progress
      // So from frame1 to current is: (base+100) - (base+33) = 67
      const totalProgress = overrides.getAdvancedTime() - frame1
      expect(totalProgress).toBe(67)
    })
  })
})
