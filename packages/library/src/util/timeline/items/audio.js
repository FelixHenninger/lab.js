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
    try {
      const decodedData = await decodeAudioData(context, buffer)
      if (!decodedData) {
        throw new Error(`No data available after decoding ${ url }`)
      }
      return decodedData
    } catch (e) {
      throw new Error(`Error decoding audio data from ${ url }`)
    }
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
  return (t - performanceTime) / 1000 + contextTime - baseLatency
}

const toPerformanceTime = (context, t) => {
  // Where available, use audio system data to calculate
  // latency compensation, as per specification.
  // See https://webaudio.github.io/web-audio-api/
  const { contextTime, performanceTime, baseLatency } =
    outputTimestamps(context)
  return (t - contextTime + baseLatency) * 1000 + performanceTime
}

const createNode = (context, type, options={}, audioParams={}) => {
  // This provides a light wrapper around the context
  // audio node creation methods, as a stopgap until
  // all browsers support node constructor functions.
  let node

  // Generate node from context
  switch(type) {
    case 'oscillator':
      node = context.createOscillator()
      break
    case 'bufferSource':
      node = context.createBufferSource()
      break
    default:
      throw new Error(`Can't create node of unknown type`)
  }

  // Apply settings
  Object.entries(options).forEach(
    ([setting, value]) => { if (value) node[setting] = value }
  )
  Object.entries(audioParams).forEach(
    ([setting, value]) => { if (value) node[setting].value = value }
  )

  return node
}

const connectNodeChain = (source, chain, destination) =>
  [source, ...chain, destination].reduce(
    (prev, next) => prev.connect(next)
  )

// Timeline items --------------------------------------------------------------

class AudioNodeItem {
  constructor(timeline, options={}) {
    this.timeline = timeline
    this.options = options
    this.processingChain = []
  }

  prepare() {
    // Add gain node
    if (this.options.gain && this.options.gain !== 1) {
      const gainNode = this.timeline.controller.audioContext.createGain()
      gainNode.gain.value = this.options.gain
      this.processingChain.push(gainNode)
    }

    connectNodeChain(
      this.source, this.processingChain,
      this.timeline.controller.audioContext.destination
    )
  }

  start(offset) {
    const { start } = this.options

    const startTime = toContextTime(
      this.timeline.controller.audioContext,
      offset + start
    )

    this.source.start(startTime)
  }

  afterStart(offset) {
    const { stop } = this.options

    if (stop) {
      const stopTime = toContextTime(
        this.timeline.controller.audioContext,
        offset + stop
      )
      this.source.stop(stopTime)
    }
  }

  teardown() {
    this.source.disconnect()
    this.source = undefined

    this.processingChain.forEach(n => n.disconnect())
    this.processingChain = []
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

    this.source = createNode(
      this.timeline.controller.audioContext,
      'bufferSource',
      { buffer },
      this.options.options,
    )
    super.prepare()
  }
}

export class OscillatorItem extends AudioNodeItem {
  prepare() {
    this.source = createNode(
      this.timeline.controller.audioContext,
      'oscillator',
      {},
      this.options.options,
    )

    super.prepare()
  }
}
