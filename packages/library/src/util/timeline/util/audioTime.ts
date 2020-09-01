export const audioSync = (context: any, useContextTiming=false) => {
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
  t: any,
  {
    contextTime,
    performanceTime,
    baseLatency
  }: any,
) => (t - performanceTime) / 1000 + contextTime - baseLatency

export const toPerformanceTime = (
  t: any,
  {
    contextTime,
    performanceTime,
    baseLatency
  }: any,
) => (t - contextTime + baseLatency) * 1000 + performanceTime
