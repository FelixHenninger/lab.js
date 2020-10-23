export const audioSync = (context: AudioContext, useContextTiming = false) => {
  if (useContextTiming && 'getOutputTimestamp' in context) {
    return {
      ...context.getOutputTimestamp(),
      baseLatency: context.baseLatency || 0,
    }
  } else {
    return {
      contextTime: context.currentTime,
      performanceTime: performance.now(),
      baseLatency: context.baseLatency || 0,
    }
  }
}

// Use audio system data to calculate latency compensation,
// as per specification. (https://webaudio.github.io/web-audio-api/)

export const toContextTime = (
  t: number,
  {
    contextTime,
    performanceTime,
    baseLatency,
  }: { contextTime: number; performanceTime: number; baseLatency: number },
) => (t - performanceTime) / 1000 + contextTime - baseLatency

export const toPerformanceTime = (
  t: number,
  {
    contextTime,
    performanceTime,
    baseLatency,
  }: { contextTime: number; performanceTime: number; baseLatency: number },
) => (t - contextTime + baseLatency) * 1000 + performanceTime
