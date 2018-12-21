import { createStore } from 'redux'
import reducer from './reducers'

import { retrieveState } from './logic/util/persistence'
import { fromURL } from './logic/util/remoteStudy'

const configureStore = async initialState =>
  createStore(
    reducer, initialState || await fromURL() || await retrieveState(),
    window.devToolsExtension && window.devToolsExtension(),
  )

export default configureStore
