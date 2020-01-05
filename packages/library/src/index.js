// Load standard library polyfill
import 'core-js/stable'

// Components
import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Frame as CanvasFrame } from './canvas'
import { Screen, Form, Frame, Page } from './html'
import { Sequence, Parallel, Loop } from './flow'

// Data storage
import { Store } from './data'

// Utilities
import { Random } from './util/random'
import fromObject from './util/fromObject'
import { transform, makeRenderFunction } from './util/canvas'
import { product } from './util/combinatorics'
import { logTimestamp } from './util/events'
import { distance, toRadians, polygon, polygonVertex } from './util/geometry'
import { launch, exit } from './util/fullscreen'
import { sum, mean, variance, std } from './util/stats'
import { FrameTimeout } from './util/timing'
import { traverse, reduce } from './util/tree'

// Plugins
import Debug from './plugins/debug'
import Download from './plugins/download'
import Fullscreen from './plugins/fullscreen'
import Logger from './plugins/log'
import Metadata from './plugins/metadata'
import NavigationGuard from './plugins/navigationGuard'
import PostMessage from './plugins/postmessage'
import Submit from './plugins/submit'
import Transmit from './plugins/transmit'

export const version = '19.1.1'
export const build = {
  flavor: BUILD_FLAVOR,
  commit: BUILD_COMMIT,
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
  Parallel,
  Loop,
}

export const plugins = {
  Debug,
  Download,
  Fullscreen,
  Logger,
  Metadata,
  NavigationGuard,
  PostMessage,
  Submit,
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
    launch, exit,
  },
  geometry: {
    distance,
    polygon,
    polygonVertex,
    toRadians,
  },
  stats: {
    sum, mean, variance, std,
  },
  timing: {
    FrameTimeout,
  },
  tree: {
    traverse, reduce,
  },
}
