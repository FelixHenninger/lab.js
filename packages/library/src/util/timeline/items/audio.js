// Utilities -------------------------------------------------------------------

// Wrap context.decodeAudioData in a callback,
// because Safari doesn't (as of now) support the promise-based variant
const decodeAudioData = (context, buffer) => {
  return new Promise((resolve, reject) => {
    context.decodeAudioData(buffer, resolve, reject)
  })
}

export const load = async (context, url, options) => {
  const response = await fetch(url, options)

  if (response.ok) {
    const buffer = await response.arrayBuffer()
    const decodedData = await decodeAudioData(context, buffer)
    return decodedData
  } else {
    throw new Error(`Couldn't load audio from ${ response.url }`)
  }
}

const outputTimestamps = context => {
  if ('getOutputTimestamp' in context) {
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

const toContextTime = (context, t) => {
  const { contextTime, performanceTime, baseLatency } =
    outputTimestamps(context)
  return (t - performanceTime) / 1000 - baseLatency + contextTime
}

const toPerformanceTime = (context, t) => {
  // Where available, use audio system data to calculate
  // latency compensation, as per specification.
  // See https://webaudio.github.io/web-audio-api/
  const { contextTime, performanceTime, baseLatency } =
    outputTimestamps(context)
  return (t - contextTime + baseLatency) * 1000 + performanceTime
}

// Timeline items --------------------------------------------------------------

class AudioNodeItem {
  constructor(timeline, options={}) {
    this.timeline = timeline
    this.options = options
  }

  prepare() {
    this.node.connect(this.timeline.controller.audioContext.destination)
  }

  start(offset) {
    const t = toContextTime(
      this.timeline.controller.audioContext,
      this.options.start + offset
    )
    this.node.start(t)
  }

  afterStart(offset) {
    if (this.options.stop) {
      const t = toContextTime(
        this.timeline.controller.audioContext,
        this.options.stop + offset
      )
      this.node.stop(t)
    }
  }

  teardown() {
    this.node.disconnect()
    this.node = null
  }
}

export class BufferSourceItem extends AudioNodeItem {
  prepare() {
    // Populate buffer from cache
    const options = {
      buffer: this.timeline.controller.cache.audio[this.options.src],
      ...(this.options.settings || {}),
    }
    this.node = new AudioBufferSourceNode(
      this.timeline.controller.audioContext,
      options
    )
    super.prepare()
  }
}

export class OscillatorItem extends AudioNodeItem {
  prepare() {
    this.node = new OscillatorNode(
      this.timeline.controller.audioContext,
      this.options.settings
    )
    super.prepare()
  }
}
