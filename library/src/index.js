// Components
import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence } from './canvas'
import { Screen, Form, Frame } from './html'
import { Sequence, Parallel, Loop } from './flow'

// Data storage
import { Store } from './data'

// Utilities
import { Random } from './util/random'
import fromObject from './util/fromObject'

// Plugins
import Debug from './plugins/debug'
import Logger from './plugins/log'
import Transmit from './plugins/transmit'

export const version = '2017.1.0'

export const core = {
  Component,
  Dummy,
}

export const canvas = {
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
  Logger,
  Transmit,
}

export const data = {
  Store,
}

export const util = {
  Random,
  fromObject,
}
