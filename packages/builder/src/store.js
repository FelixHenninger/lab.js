import { createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import reducer from './reducers'
import { retrieveState } from './logic/util/persistence'
import { fromURL } from './logic/util/remoteStudy'

const configureStore = async initialState =>
  createStore(
    reducer,
    initialState || await fromURL() || await retrieveState(),
    composeWithDevTools(),
  )

export default configureStore
