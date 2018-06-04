// Polyfill
import 'babel-polyfill'

// Components
import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence,
  Frame as CanvasFrame } from './canvas'
import { Screen, Form, Frame } from './html'
import { Sequence, Parallel, Loop } from './flow'

// Data storage
import { Store } from './data'

// Utilities
import { Random } from './util/random'
import fromObject from './util/fromObject'
import { transform, makeRenderFunction } from './util/canvas'
import { toRadians, polygon, polygonVertex } from './util/geometry'
import { launch, exit } from './util/fullscreen'
import { sum, mean, variance, std } from './util/stats'
import { FrameTimeout } from './util/timing'
import { traverse, reduce } from './util/tree'

// Plugins
import Debug from './plugins/debug'
import Download from './plugins/download'
import Logger from './plugins/log'
import Metadata from './plugins/metadata'
import PostMessage from './plugins/postmessage'
import Submit from './plugins/submit'
import Transmit from './plugins/transmit'

export const version = '2018.0.1'
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
  Sequence: CanvasSequence,
}

export const html = {
  Screen,
  Form,
  Frame,
}

export const flow = {
  Sequence,
  Parallel,
  Loop,
}

export const plugins = {
  Debug,
  Download,
  Logger,
  Metadata,
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
    // TODO: This is in here for backward compatibility,
    // it has since moved to the geometry package;
    // remove in a later version (2018+)
    toRadians,
    transform,
  },
  fullscreen: {
    launch, exit,
  },
  geometry: {
    polygon,
    polygonVertex,
    toRadians,
  },
  stats: {
    sum, mean, variance, std
  },
  timing: {
    FrameTimeout,
  },
  tree: {
    traverse, reduce,
  },
}
