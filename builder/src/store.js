import { createStore } from 'redux'
import reducer from './reducers'

import { retrieveState } from './logic/util/persistence'

const configureStore = initialState =>
  createStore(
    reducer, initialState || retrieveState(),
    window.devToolsExtension && window.devToolsExtension(),
  )

export default configureStore()
