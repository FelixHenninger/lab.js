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

const version = '2017.1.0'

const lab = {
  version,
  core: {
    Component,
    Dummy,
  },
  canvas: {
    Screen: CanvasScreen,
    Sequence: CanvasSequence,
  },
  html: {
    Screen,
    Form,
    Frame,
  },
  flow: {
    Sequence,
    Parallel,
    Loop,
  },
  data: {
    Store,
  },
  plugins: {
    Debug,
    Logger,
    Transmit,
  },
  util: {
    Random,
    fromObject,
  },
}

// Export library
export default lab

// This is for webpack, which does not cope well
// with es6 exports at the top level, preferring
// instead to place exports at lab.default.
// The following line makes the library behave
// like a standard ES5-style library.
module.exports = lab
