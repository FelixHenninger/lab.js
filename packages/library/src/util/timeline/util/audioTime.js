export const audioSync = (context, useContextTiming=false) => {
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

export const toContextTime = (context, t, syncTimestamps) => {
  const { contextTime, performanceTime, baseLatency } =
    syncTimestamps || audioSync(context)
  return (t - performanceTime) / 1000 + contextTime - baseLatency
}

export const toPerformanceTime = (context, t, syncTimestamps) => {
  // Where available, use audio system data to calculate
  // latency compensation, as per specification.
  // See https://webaudio.github.io/web-audio-api/
  const { contextTime, performanceTime, baseLatency } =
    syncTimestamps || audioSync(context)
  return (t - contextTime + baseLatency) * 1000 + performanceTime
}
