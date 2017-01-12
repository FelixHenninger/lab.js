import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence } from './canvas'
import { Screen, Form, Frame } from './html'
import { Sequence, Parallel, Loop } from './flow'
import { Store } from './data'
import { Random } from './util/random'
import fromObject from './util/fromObject'
import Debug from './plugins/debug'
import Logger from './plugins/log'

const version = '2016.1.0'

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
