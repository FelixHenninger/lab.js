
import { BaseElement, DummyElement } from './core'
import { CanvasScreen, CanvasSequence } from './core-display-canvas'
import { HTMLScreen, FormScreen } from './core-display-html'
import { Sequence, Parallel } from './core-flow'
import { DataStore } from './data'

const version = '2015'

export default {
  version: version,
  BaseElement: BaseElement,
  DummyElement: DummyElement,
  CanvasScreen: CanvasScreen,
  CanvasSequence: CanvasSequence,
  HTMLScreen: HTMLScreen,
  FormScreen: FormScreen,
  Sequence: Sequence,
  Parallel: Parallel,
  DataStore: DataStore
}
