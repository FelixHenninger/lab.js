import { createStore } from 'redux'
import reducer from './reducers'

const configureStore = (initialState) =>
  createStore(
    reducer, initialState,
    window.devToolsExtension && window.devToolsExtension(),
  )

export default configureStore()
