import { audioSync, toContextTime } from '../util/audioTime'
import { requestIdleCallback } from '../../timing'

// Utilities -------------------------------------------------------------------

// Wrap context.decodeAudioData in a callback,
// because Safari doesn't (as of now) support the promise-based variant
const decodeAudioData = (context, buffer) =>
  new Promise((resolve, reject) => {
    context.decodeAudioData(buffer, resolve, reject)
  })

export const load = async (url, context, fetchOptions) => {
  const response = await fetch(url, fetchOptions)

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

const createNode = (type, context, options={}, audioParams={}) => {
  // This provides a light wrapper around the context
  // audio node creation methods, as a stopgap until
  // all browsers support node constructor functions.
  let node

  // Generate node from context
  switch (type) {
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
  [source, ...chain, destination].reduce((prev, next) => {
    // This code is necessary to fix a bug in older implementations
    // of the web audio API, where node.connect(destination) does
    // not return the destination. This was specifically an issue for
    // Safari 12.0, and can be removed at a later point
    prev.connect(next)
    return next
  })

// Timeline items --------------------------------------------------------------

class AudioNodeItem {
  defaultPayload = {
    panningModel: 'equalpower',
  }

  constructor(timeline, options={}, payload={}) {
    this.timeline = timeline
    this.options = options
    this.payload = {
      ...this.defaultPayload,
      ...payload,
      // Only override gain if it is truly undefined (zero values are ok)
      gain: payload.gain ?? 1,
    }
    this.processingChain = []
    this.nodeOrder = {}
  }

  // Scheduling helpers --------------------------------------------------------

  setAudioOrigin() {
    // Save timing information
    this.audioSyncOrigin = audioSync(this.timeline.controller.audioContext)
  }

  schedule(t) {
    return toContextTime(t, this.audioSyncOrigin)
  }

  // Event handlers ------------------------------------------------------------

  prepare() {
    const audioContext = this.timeline.controller.audioContext

    // Add gain node
    if (
      (typeof this.payload.gain === 'number' && this.payload.gain !== 1) ||
      (this.payload.rampUp && this.payload.rampUp !== 0) ||
      (this.payload.rampDown && this.payload.rampDown !== 0)
    ) {
      const gainNode = audioContext.createGain()
      gainNode.gain.value = this.payload.rampUp ? 10**-10 : this.payload.gain
      this.nodeOrder.gain = this.processingChain.push(gainNode) - 1
    }

    // Add panner node
    if (this.payload.pan && this.payload.pan !== 0) {
      const pannerNode = audioContext.createPanner()
      pannerNode.panningModel = this.payload.panningModel
      pannerNode.setPosition(
        this.payload.pan, 0,
        1 - Math.abs(this.payload.pan),
      )
      this.processingChain.push(pannerNode)
    }

    connectNodeChain(
      this.source,
      this.processingChain,
      audioContext.destination,
    )
  }

  start(offset) {
    const { start } = this.options
    const { rampUp } = this.payload

    const audioContext = this.timeline.controller.audioContext
    if (audioContext.state !== 'running') {
      console.warn(
        `Sending audio to a context in ${ audioContext.state } state.`,
        'This may result in missing sounds —',
        'Please make sure that users interact with the page',
        'before using audio.',
      )
    }

    this.setAudioOrigin()
    const startTime = Math.max(0, this.schedule(offset + start))

    if (rampUp) {
      const gain = this.processingChain[this.nodeOrder.gain].gain

      // Calculate transition point
      const rampUpEnd = this.schedule(offset + start + parseFloat(rampUp))

      // Cue transition
      gain.setValueAtTime(10**-10, startTime)
      gain.exponentialRampToValueAtTime(this.payload.gain, rampUpEnd)
    }

    this.source.start(startTime)
  }

  afterStart(offset) {
    const { stop } = this.options
    const { rampDown } = this.payload

    if (stop && rampDown) {
      const gain = this.processingChain[this.nodeOrder.gain].gain

      const rampDownStart = this.schedule(offset + stop - parseFloat(rampDown))
      const stopTime = this.schedule(offset + stop)

      // Cue transition (we can't go all the way because of the
      // exponential transform, but the node will be stopped shortly,
      // anyway)
      gain.setValueAtTime(this.payload.gain, rampDownStart)
      gain.exponentialRampToValueAtTime(0.0001, stopTime)
    }

    if (stop) {
      const stopTime = this.schedule(offset + stop)
      this.source.stop(stopTime)
    }
  }

  end(t, force) {
    const endNow = force || !this.options.stop
    const endTime = endNow ? t : this.timeline.offset + this.options.stop

    // Schedule item stop if necessary
    if (endNow) {
      const stopTime = this.schedule(t)
      this.source.stop(stopTime)
    }

    // Schedule teardown
    window.setTimeout(
      () => requestIdleCallback(() => this.teardown()),
      endTime - performance.now() + 20, // pad for good measure
    )
  }

  teardown() {
    this.source.disconnect()
    this.source = undefined

    this.processingChain.forEach(n => n.disconnect())
    this.processingChain = []
    this.nodeOrder = {}
  }
}

export class BufferSourceItem extends AudioNodeItem {
  async prepare() {
    // Populate buffer from cache, if possible
    const { cache, audioContext } = this.timeline.controller
    const { src, loop } = this.payload

    let buffer
    if (cache.audio[src]) {
      buffer = cache.audio[src]
    } else {
      // Otherwise, load audio file from URL
      try {
        buffer = await load(src, audioContext, { mode: 'cors' })
        cache.audio[src] = cache.audio[src] || buffer
      } catch (e) {
        console.warn(
          'Audio timeline item missing content, will remain silent.',
          `Source: ${ src }, Error: ${ e.message }`,
        )
      }
    }
    // TODO: This seems to be the wrong place for a fallback.
    // Adjust the caching mechanism so that the preload stage knows
    // about the audio file, so that the cache is always present.

    this.source = createNode('bufferSource', audioContext, { buffer, loop })
    super.prepare()
  }
}

export class OscillatorItem extends AudioNodeItem {
  prepare() {
    const { type, frequency, detune } = this.payload

    this.source = createNode(
      'oscillator',
      this.timeline.controller.audioContext,
      { type },
      { frequency, detune },
    )

    super.prepare()
  }
}
