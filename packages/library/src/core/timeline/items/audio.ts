import { audioSync, toContextTime } from '../util/audioTime'
import { requestIdleCallback } from '../../timing/shims'
import { Timeline } from '..'

// Utilities -------------------------------------------------------------------

// Wrap context.decodeAudioData in a callback,
// because Safari doesn't (as of now) support the promise-based variant
const decodeAudioData = (context: AudioContext, buffer: ArrayBuffer) =>
  new Promise((resolve, reject) => {
    context.decodeAudioData(buffer, resolve, reject)
  })

export const load = async (
  url: string,
  context: AudioContext,
  fetchOptions?: RequestInit,
) => {
  const response = await fetch(url, fetchOptions)

  if (response.ok) {
    const buffer = await response.arrayBuffer()
    try {
      const decodedData = await decodeAudioData(context, buffer)
      if (!decodedData) {
        throw new Error(`No data available after decoding ${url}`)
      }
      return decodedData
    } catch (e) {
      throw new Error(`Error decoding audio data from ${url}`)
    }
  } else {
    throw new Error(`Couldn't load audio from ${response.url}`)
  }
}

const createNode = (
  type: 'oscillator' | 'bufferSource',
  context: AudioContext,
  options = {},
  audioParams = {},
) => {
  // This provides a light wrapper around the context
  // audio node creation methods, as a stopgap until
  // all browsers support node constructor functions.
  let node: OscillatorNode | AudioBufferSourceNode

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
  Object.entries(options).forEach(([setting, value]) => {
    //@ts-ignore TS is unhappy with the dynamic use of settings here
    if (value) node[setting] = value
  })
  Object.entries(audioParams).forEach(([setting, value]) => {
    //@ts-ignore TS is unhappy with the dynamic use of settings here
    if (value) node[setting].value = value
  })

  return node
}

const connectNodeChain = (
  source: AudioNode,
  chain: AudioNode[],
  destination: AudioNode,
) =>
  [source, ...chain, destination].reduce((prev, next) => {
    // This code is necessary to fix a bug in older implementations
    // of the web audio API, where node.connect(destination) does
    // not return the destination. This was specifically an issue for
    // Safari 12.0, and can be removed at a later point
    prev.connect(next)
    return next
  })

// Timeline items --------------------------------------------------------------

const defaultPayload = {
  gain: 1,
  pan: 0,
  rampUp: 0,
  rampDown: 0,
  panningModel: 'equalpower',
}

type nodeOrder = {
  gain?: number
}

class AudioNodeItem {
  static defaultPayload = defaultPayload
  payload: typeof defaultPayload
  options: any
  timeline: Timeline

  source?: AudioScheduledSourceNode
  processingChain: AudioNode[]
  destination!: AudioNode
  nodeOrder: nodeOrder

  audioSyncOrigin!: {
    baseLatency: number
    contextTime: number
    performanceTime: number
  }

  constructor(
    timeline: Timeline,
    options = {},
    payload: Partial<typeof defaultPayload> = defaultPayload,
  ) {
    this.timeline = timeline
    this.options = options
    this.payload = {
      ...Object.getPrototypeOf(this).constructor.defaultPayload,
      ...payload,
      // Only override gain if it is truly undefined (zero values are ok)
      gain: payload.gain ?? 1,
    }
    this.processingChain = []
    this.nodeOrder = {
      gain: undefined,
    }
  }

  // Scheduling helpers --------------------------------------------------------

  setAudioOrigin() {
    // Save timing information
    this.audioSyncOrigin = audioSync(
      this.timeline.controller.global.audioContext,
    )
  }

  schedule(t: number) {
    return toContextTime(t, this.audioSyncOrigin)
  }

  // Event handlers ------------------------------------------------------------

  prepare() {
    const audioContext = this.timeline.controller.global.audioContext

    // Add gain node
    if (
      (typeof this.payload.gain === 'number' && this.payload.gain !== 1) ||
      (this.payload.rampUp && this.payload.rampUp !== 0) ||
      (this.payload.rampDown && this.payload.rampDown !== 0)
    ) {
      const gainNode = audioContext.createGain()
      gainNode.gain.value = this.payload.rampUp ? 10 ** -10 : this.payload.gain
      this.nodeOrder.gain = this.processingChain.push(gainNode) - 1
    }

    // Add panner node
    if (this.payload.pan && this.payload.pan !== 0) {
      const pannerNode = audioContext.createPanner()
      pannerNode.panningModel = this.payload.panningModel
      pannerNode.setPosition(
        this.payload.pan,
        0,
        1 - Math.abs(this.payload.pan),
      )
      this.processingChain.push(pannerNode)
    }

    connectNodeChain(
      this.source!,
      this.processingChain,
      audioContext.destination,
    )
  }

  start(offset: number) {
    const { start } = this.options
    const { rampUp } = this.payload

    const audioContext = this.timeline.controller.global.audioContext
    if (audioContext.state !== 'running') {
      console.warn(
        `Sending audio to a context in ${audioContext.state} state.`,
        'This may result in missing sounds —',
        'Please make sure that users interact with the page',
        'before using audio.',
      )
    }

    this.setAudioOrigin()
    const startTime = Math.max(0, this.schedule(offset + start))

    if (rampUp) {
      const gain = (this.processingChain[this.nodeOrder.gain!] as GainNode).gain

      // Calculate transition point
      const rampUpEnd = this.schedule(
        offset +
          start +
          (typeof rampUp === 'number' ? rampUp : parseFloat(rampUp)),
      )

      // Cue transition
      gain.setValueAtTime(10 ** -10, startTime)
      gain.exponentialRampToValueAtTime(this.payload.gain, rampUpEnd)
    }

    this.source!.start(startTime)
  }

  afterStart(offset: number) {
    const { stop } = this.options
    const { rampDown } = this.payload

    if (stop && rampDown) {
      const gain = (this.processingChain[this.nodeOrder.gain!] as GainNode).gain

      const rampDownStart = this.schedule(
        offset +
          stop -
          (typeof rampDown === 'number' ? rampDown : parseFloat(rampDown)),
      )
      const stopTime = this.schedule(offset + stop)

      // Cue transition (we can't go all the way because of the
      // exponential transform, but the node will be stopped shortly,
      // anyway)
      gain.setValueAtTime(this.payload.gain, rampDownStart)
      gain.exponentialRampToValueAtTime(0.0001, stopTime)
    }

    if (stop) {
      const stopTime = this.schedule(offset + stop)
      this.source!.stop(stopTime)
    }
  }

  end(t: number, force: boolean) {
    const endNow = force || !this.options.stop
    const endTime = endNow ? t : this.timeline.offset + this.options.stop

    // Schedule item stop if necessary
    if (endNow) {
      const stopTime = this.schedule(t)
      this.source!.stop(stopTime)
    }

    // Schedule teardown
    window.setTimeout(
      () => requestIdleCallback(() => this.teardown()),
      endTime - performance.now() + 20, // pad for good measure
    )
  }

  teardown() {
    this.source!.disconnect()
    this.source = undefined

    this.processingChain.forEach(n => n.disconnect())
    this.processingChain = []
    this.nodeOrder = {}
  }
}

// Buffer audio source ---------------------------------------------------------

const defaultBufferSourcePayload = {
  src: '',
  loop: false,
}

export class BufferSourceItem extends AudioNodeItem {
  static defaultPayload = {
    ...defaultPayload,
    ...defaultBufferSourcePayload,
  }
  payload!: typeof defaultPayload & typeof defaultBufferSourcePayload

  async prepare() {
    // Populate buffer from cache, if possible
    const { cache, audioContext } = this.timeline.controller.global
    const { src, loop } = this.payload
    const buffer = await cache.audio.get(src)

    this.source = createNode('bufferSource', audioContext, { buffer, loop })
    super.prepare()
  }
}

// Oscillator ------------------------------------------------------------------

const defaultOscillatorPayload = {
  type: 'sine',
  frequency: 440,
  detune: 0,
}

export class OscillatorItem extends AudioNodeItem {
  static defaultPayload = {
    ...defaultPayload,
    ...defaultOscillatorPayload,
  }
  payload!: typeof defaultPayload & typeof defaultOscillatorPayload

  prepare() {
    const { type, frequency, detune } = this.payload

    this.source = createNode(
      'oscillator',
      this.timeline.controller.global.audioContext,
      { type },
      { frequency, detune },
    )

    super.prepare()
  }
}
