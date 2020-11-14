// Components
import { Component } from './core/component'
import { Dummy } from './core/dummy'
import { Screen as CanvasScreen } from './canvas/screen'
import { Frame as CanvasFrame } from './canvas/frame'
import { Page } from './html/page'
import { Frame } from './html/frame'
import { Form } from './html/form'
import { Screen } from './html/screen'
import { Loop } from './flow/loop'
import { Sequence } from './flow/sequence'

// Data storage
import { Store } from './data/store'

// Utilities
import { Random } from './util/random'
import fromObject from './util/fromObject'
import { makeRenderFunction } from './canvas/util/render'
import { transform } from './canvas/util/transform'
import { product } from './util/combinatorics'
import { logTimestamp } from './util/events'
import { distance, toRadians, polygon, polygonVertex } from './util/geometry'
import { launch, exit } from './util/fullscreen'
import { sum, mean, variance, std } from './util/stats'
import { FrameTimeout } from './core/timing/timeout'
import { traverse, reduce } from './base/util/tree'

// Plugins
import Debug from './plugins/debug'
import Download from './plugins/download'
import Fullscreen from './plugins/fullscreen'
import Logger from './plugins/log'
import Metadata from './plugins/metadata'
import NavigationGuard from './plugins/navigationGuard'
import Paradata from './plugins/paradata'
import PostMessage from './plugins/postmessage'
import Submit from './plugins/submit'
import Style from './plugins/style'
import Transmit from './plugins/transmit'

export const version = '20.2.4'
export const build = {
  //@ts-ignore Injected by webpack
  flavor: <string>BUILD_FLAVOR,
  //@ts-ignore Injected by webpack
  commit: <string>BUILD_COMMIT,
}

export const core = {
  Component,
  Dummy,
}

export const canvas = {
  Frame: CanvasFrame,
  Screen: CanvasScreen,
}

export const html = {
  Screen,
  Form,
  Frame,
  Page,
}

export const flow = {
  Sequence,
  Loop,
}

export const plugins = {
  Debug,
  Download,
  Fullscreen,
  Logger,
  Metadata,
  NavigationGuard,
  Paradata,
  PostMessage,
  Submit,
  Style,
  Transmit,
}

export const data = {
  Store,
}

export const util = {
  Random,
  fromObject,
  canvas: {
    makeRenderFunction,
    transform,
  },
  combinatorics: {
    product,
  },
  events: {
    logTimestamp,
  },
  fullscreen: {
    launch,
    exit,
  },
  geometry: {
    distance,
    polygon,
    polygonVertex,
    toRadians,
  },
  stats: {
    sum,
    mean,
    variance,
    std,
  },
  timing: {
    FrameTimeout,
  },
  tree: {
    traverse,
    reduce,
  },
}
