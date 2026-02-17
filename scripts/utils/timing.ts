export interface FrameTimeConfig {
  fps: number
  duration: number
}

export interface TimingState {
  frameTimeBase: number
  frameProgress: number
  advancedTime: number
  intervalData: Map<number, { cb: () => void; targetTime: number; delay: number }>
  nextIntervalId: number
}

export function createTimingState(baseTime: number): TimingState {
  return {
    frameTimeBase: baseTime,
    frameProgress: 0,
    advancedTime: baseTime,
    intervalData: new Map(),
    nextIntervalId: 0,
  }
}

export function advanceFrame(state: TimingState, msPerFrame: number): number {
  state.frameProgress += msPerFrame
  state.advancedTime = state.frameTimeBase + state.frameProgress
  return state.advancedTime
}

export function getDateNowOverride(state: TimingState): () => number {
  return () => state.advancedTime
}

export function getSetTimeoutOverride(
  state: TimingState,
): (cb: () => void, delay: number) => number {
  const originalSetTimeout = window.setTimeout
  return (cb: () => void, delay: number) => {
    const targetTime = state.advancedTime + delay

    if (targetTime <= state.advancedTime) {
      try {
        cb()
      } catch {
        // Ignore errors
      }
      return 0
    }

    const adjustedDelay = targetTime - state.advancedTime
    return originalSetTimeout(cb, adjustedDelay)
  }
}

export function getSetIntervalOverride(
  state: TimingState,
): (cb: () => void, delay: number) => number {
  return (cb: () => void, delay: number) => {
    const id = ++state.nextIntervalId
    state.intervalData.set(id, {
      cb,
      targetTime: state.advancedTime + delay,
      delay,
    })
    return id
  }
}

export function getClearIntervalOverride(state: TimingState): (_id: number) => void {
  return (_id: number) => {
    state.intervalData.delete(_id)
  }
}

export function triggerDueIntervals(state: TimingState): void {
  state.intervalData.forEach((data, _id) => {
    if (state.advancedTime >= data.targetTime) {
      try {
        data.cb()
        data.targetTime = state.advancedTime + data.delay
      } catch {
        // Ignore errors
      }
    }
  })
}

export function getRAFOverride(state: TimingState): (cb: (time: number) => void) => number {
  return (cb: (time: number) => void) => {
    try {
      cb(state.advancedTime)
    } catch {
      // Ignore errors
    }
    return 0
  }
}

export function getCancelRAFOverride(): (_id: number) => void {
  return () => {
    // No-op since we're overriding requestAnimationFrame
  }
}

export function createTimingOverrides(_config: FrameTimeConfig) {
  let state = createTimingState(Date.now())

  return {
    init: () => {
      state = createTimingState(Date.now())
    },

    advanceFrame: (msPerFrame: number): number => {
      return advanceFrame(state, msPerFrame)
    },

    getAdvancedTime: (): number => {
      return state.advancedTime
    },

    getDateNowOverride: getDateNowOverride(state),

    getSetTimeoutOverride: () => getSetTimeoutOverride(state),

    getSetIntervalOverride: () => getSetIntervalOverride(state),

    getClearIntervalOverride: () => getClearIntervalOverride(state),

    triggerDueIntervals: () => triggerDueIntervals(state),

    getRAFOverride: () => getRAFOverride(state),

    getCancelRAFOverride,

    getState: () => state,
  }
}
