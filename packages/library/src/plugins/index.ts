// Plugin interface definition
import { Plugin as BasePlugin } from '../base/plugin'
import { Component, EventName } from '../core'

export type Plugin<
  C extends Component = Component,
  E extends EventName = EventName,
> = BasePlugin<C, E>

export { default as Debug, type DebugPluginOptions } from './debug'
export { default as Download, type DownloadPluginOptions } from './download'
export {
  default as Fullscreen,
  type FullscreenPluginOptions,
} from './fullscreen'
export { default as Logger, type LoggerPluginOptions } from './log'
export { default as Metadata, type MetadataPluginOptions } from './metadata'
export { default as NavigationGuard } from './navigationGuard'
export { default as Paradata } from './paradata'
export {
  default as PostMessage,
  type PostMessagePluginOptions,
} from './postmessage'
export { default as Submit } from './submit'
export { default as Style } from './style'
export { default as Transmit, type TransmitPluginOptions } from './transmit'
