
import { BaseElement, DummyElement } from './core'
import { CanvasScreen, CanvasSequence } from './core-display-canvas'
import { HTMLScreen, FormScreen } from './core-display-html'
import { Sequence, Parallel } from './core-flow'
import { DataStore } from './data'

const version = '2015'

export default {
  version,
  BaseElement,
  DummyElement,
  CanvasScreen,
  CanvasSequence,
  HTMLScreen,
  FormScreen,
  Sequence,
  Parallel,
  DataStore,
}
