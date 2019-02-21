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
    // Splice in gain node if gain is set
    if (this.options.gain && this.options.gain !== 1) {
      this.gainNode = this.timeline.controller.audioContext.createGain()
      this.gainNode.gain.value = this.options.gain
      this.node
        .connect(this.gainNode)
        .connect(this.timeline.controller.audioContext.destination)
    } else {
      this.node.connect(this.timeline.controller.audioContext.destination)
    }
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

    // Remove gain node, if present
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
  }
}

export class BufferSourceItem extends AudioNodeItem {
  async prepare() {
    // Populate buffer from cache
    const cache = this.timeline.controller.cache
    let buffer
    if (cache.audio[this.options.src]) {
      buffer = cache.audio[this.options.src]
    } else {
      buffer = await load(
        this.timeline.controller.audioContext,
        this.options.src,
        { mode: 'cors' }
      )
      cache.audio[this.options.src] = cache.audio[this.options.src] || buffer
    }
    // TODO: This seems to be the wrong place for a fallback.
    // Adjust the caching mechanism so that the preload stage knows
    // about the audio file, so that the cache is always present.

    this.node = new AudioBufferSourceNode(
      this.timeline.controller.audioContext,
      {
        buffer,
        ...(this.options.settings || {}),
      }
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
