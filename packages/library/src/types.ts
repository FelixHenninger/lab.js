import { Screen } from './canvas'
import { Component } from './core'
import { Store } from './data'
import { Loop } from './flow'
import { Frame } from './html'
import PluginAPI from './plugins/api'
import { RandomOptions } from './util/random'
import { Timeline } from './util/timeline'

// ---------------------------------------------------------------
// Component

// TODO: There's a note in the docs that seems to describe the ability
// to define custom options. Is that a real use-case worth supporting?
export interface ComponentOptions {
  // Provides additional debug information when enabled
  debug?: boolean
  // Element in DOM into which component is inserted
  el?: HTMLElement
  // Human-readable component title that will be included in any data stored by the component
  title?: string | null
  // Machine-readable component identifier
  id?: string | null
  /**
   * Settings that govern component’s behavior ({})
   * This object contains any user-specified custom settings that determine
   * a component’s content and behavior. These may, for example, be used to fill
   * placeholders in the information presented to participants, as a html.Screen() does.
   */
  parameters?: Parameters
  // Whether to end immediately after running
  skip?: boolean
  /**
   * Setting this attribute to true will mean that the component needs to be prepared manually through a call to prepare(), or (failing this)
   * that it will be prepared immediately before it is run(), at the last minute.
   */
  tardy?: boolean
  /**
   * Map of response events onto response descriptions ({})
   * The responses object maps the actions a participant might take onto the responses saved in the data. If a response is collected,
   * the end() method is called immediately.
   */
  responses?: ResponseMap
  /**
   * Correct response
   */
  correctResponse?: string | null
  /**
   * Delay between component run and automatic end (null)
   * The component automatically ends after the number of milliseconds specified in
   * this option, if it is set.
   */
  timeout?: number
  /**
   * Additional data
   * Any additional data (e.g. regarding the current trial) to be saved alongside automatically generated data entries (e.g. response and response time). This option should be an object, with the desired information in its keys and values.
   * Please consult the entry for the parameters for an explanation of the difference between these and data.
   */
  data?: { [key: string]: any }
  /**
   * Store for any generated data
   * A data.Store() object to handle data collection (and export). If this is not set, the data will not be collected in a central location outside the component itself.
   */
  datastore?: Store | null
  /**
   * Whether to commit data by default
   * If you would prefer to handle data manually, unset this option to prevent data from being commit when the component ends.
   */
  datacommit?: boolean
  /** Media files to preload
   * Images and audio files can be preloaded in the background during the prepare phase, to reduce load times later during the experiment. To achieve this, supply an object containing the urls of the files in question, split into images and audio files as follows: */
  media?: { images: string[]; audio: string[] }
  /**
   * Array of plugins that interact with the component, and are automatically notified of events. For example, adding a plugins.Logger() instance will log event notifications onto the console:
   */
  plugins?: PluginAPI[]
  /**
   * Map of additional event handlers
   * In many experiments, the only events that need to be handled are responses, which can be defined using the responses option described above. However, some studies may require additional handling of events before a final response is collected. In these cases, the events object offers an alternative.
   */
  events?: { [eventType: string]: (event: Event) => void }
  /**
   * Map of internal component events to handler functions
   * This is a shorthand for the on() method
   */
  messageHandlers?: { [internalEventType: string]: () => void }
  /** -------------------------------
   * Internal Options
   */
  /**
   * Files to preload
   */
  files?: { [key: string]: string }
  /**
   * Timeline
   */
  timeline?: Timeline
  /**
   * Random
   */
  random?: RandomOptions
  /**
   * Timing
   */
  timing?: { method: 'frames' | 'stack' }
  /**
   * Jump to top of page on load
   */
  scrollTop?: boolean
}

export interface ComponentMetadata {
  module: ('core' | 'flow' | 'canvas')[]
  nestedComponents: Component[]
  parsableOptions: ComponentOptions
}

// TODO: Is it possible to type DOM event types more strictly?
// TypeScript Event class type field is just a string
// TODO: Add target element mapping
export interface ResponseMap {
  [eventType: string]: string
}

// TODO: Discuss how to have some helpful compile-time typing of parameters
// For example, optional to generically type Component by a Parameters interface?
export interface Parameters {
  [key: string]: any
}

// ---------------------------------------------------------------
// Screen

// TODO: Correct and document these
export interface ScreenOptions extends ComponentOptions {
  items?: any
  events?: Record<string, any>
  content?: string
  contentUrl?: string
  validator?: (arg1: any) => boolean
  submitButtonText?: string
  submitButtonPosition?: string
  width?: number
}

// ---------------------------------------------------------------
// Frame

// TODO: Correct and document these
export interface FrameOptions extends ComponentOptions {
  content?: Frame
  context?: string
  contextSelector?: string
}

// ---------------------------------------------------------------
// Canvas Screen

export interface CanvasScreenOptions extends ComponentOptions {
  /**
   * The render function contains any code that draws on the canvas when the screen is shown
   */
  renderFunction?: (
    timestamp: number,
    canvas: HTMLCanvasElement,
    ctx: RenderingContext,
    obj: Screen,
  ) => void
  /**
   * Type of canvas context passed to the render function (via the ctx parameter, as described above).
   * By default, the context will be of the 2d variety, which will probably be most commonly used in experiments.
   * However, more types are possible, in particular if the content is three-dimensional or drawn using 3d hardware acceleration.
   */
  ctxType?: string
  /**
   * Shift the origin of the coordinate system to the center of the visible canvas.
   */
  translateOrigin?: boolean
  /**
   * Size of canvas content in pixels ([x, y]).
   */
  viewport?: [number, number]
  /**
   * Scale viewport to fit screen: 'auto' (default), or numeric scale factor.
   */
  viewportScale?: 'auto' | number
  /**
   * Draw viewport borders. Defaults to false
   */
  viewportEdge?: boolean
  /**
   * Use native rendering resolution for high-DPI (retina) displays. Defaults to true
   */
  devicePixelScaling?: boolean
  /** -------------------------------
   * Internal Options
   */
  // TODO: discuss 3D rendering contexts. The Canvas Screen element seems to completely assume that ctx is Canvas2D right now
  ctx?: RenderingContext
  canvas?: HTMLCanvasElement
  clearCanvas?: () => void
  content?: MediaContent[]
}

// TODO: Discuss how this is used and whether it should be renamed and/or refactored out of options
interface MediaContent {
  type: 'image'
  src: string
}

// ---------------------------------------------------------------
// Sequence

export interface SequenceOptions extends ComponentOptions {
  /**
   * List of components to run in sequence.
   * When the sequence is prepared or run, the constituent parts are prepared and run in sequence.
   */
  content?: Component[]
  /**
   * Run the content components in random order.
   * If this option is set to true, the content of the sequence is shuffled during the prepare phase.
   */
  shuffle?: boolean
  /**
   * List of options passed to nested components.
   * The options specified as handMeDowns are transferred to nested components during the prepare phase. This option is largely for convenience, and designed to decrease the amount of repetition when all nested components behave similarly – typically, nested components share the same data storage and output element, so these are passed on by default.
   */
  handMeDowns?: Array<keyof ComponentOptions>
  /** -------------------------------
   * Internal Options
   */
  indexParameter?: string
}

// ---------------------------------------------------------------
// Loop

export interface LoopOptions extends SequenceOptions {
  /**
   * List of components to run in sequence
   * When the sequence is prepared or run, the constituent parts are prepared and run in sequence.
   */
  template?: Component | TemplateConstructor | null
  /**
   * Array of parameter sets for each individual repetition
   * This option defines the parameters for every repetition of the template. Each individual set of parameters is defined as an object with name/value pairs, and these objects are combined to an array:
   */
  templateParameters?: Parameters[]
  /**
   * Options for sampling from the templated parameters
   */
  sample?: SampleOptions
  /** -------------------------------
   * Internal Options
   */
  /**
   * Groups of keys to shuffle independently
   */
  shuffleGroups?: string[]
  /**
   * Whether or not to shuffle ungrouped keys
   */
  shuffleUngrouped?: boolean
}

export interface SampleOptions {
  /**
   * The number of samples to draw from the templateParameters. If not specified, the number of samples defaults to the number of available parameter sets.
   * Thus, in sequential, draw and draw-shuffle mode, leaving this option unset ensures that all parameter sets are used.
   */
  n?: number
  /**
   * How to sample from the iterations while constructing the loop.
   */
  mode: 'sequential' | 'draw' | 'draw-shuffle' | 'draw-replace'
  /**
   * Deprecated syntax for whether to replace
   */
  replace?: boolean
}

export type TemplateConstructor = (
  templateParameters: Parameters,
  index: number,
  loop: Loop,
) => Component

// ---------------------------------------------------------------
// Parallel

export interface ParallelOptions extends ComponentOptions {
  /**
   * List of components to run in parallel
   */
  content?: Component[]
  /**
   * How to react to nested elements ending
   * If this option is set to 'race', the entire flow.Parallel() component ends as soon as the first nested component ends.In this case, any remaining components are shut down automatically (by calling end()).
   * If the mode is set to 'all', it waits until all nested items have ended by themselves.
   */
  mode?: 'race' | 'all'
  /**
   * List of options passed to nested components
   * The options specified as handMeDowns are transferred to nested components during the prepare phase. This option is largely for convenience, and designed to decrease the amount of repetition when all nested components behave similarly – typically, nested components share the same data storage and output element, so these are passed on by default.
   */
  handMeDowns?: Array<keyof ComponentOptions>
}
