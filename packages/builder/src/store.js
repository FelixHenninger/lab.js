import { createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import * as Sentry from '@sentry/react'

import reducer from './reducers'
import { retrieveState } from './logic/util/persistence'
import { fromURL } from './logic/util/remoteStudy'
import { mapValues } from 'lodash'

// State sanitization for Sentry -----------------------------------------------

const omittedFile = 'data:,file omitted'

const stripFileContent = (files) =>
  mapValues(files, v => ({ ...v, content: omittedFile }))

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) => {
    if (action.type === "HYDRATE") {
      return {
        ...action,
        state: 'omitted'
      }
    } else if (action.type === "IMPORT_COMPONENT") {
      return {
        ...action,
        source: 'omitted'
      }
    } else if (action.type === "ADD_FILES") {
      return {
        ...action,
        files: action.files.map(
          f => ({ ...f, data: { ...f.data, content: omittedFile } })
        ),
      }
    } else if (action.type === "UPDATE_FILE") {
      return {
        ...action,
        data: {
          ...action.data,
          content: omittedFile,
        }
      }
    } else if (action.type === 'MERGE_FILES') {
      return {
        ...action,
        files: action.files.map(
          f => ({ ...f, data: { ...f.data, content: omittedFile } })
        ),
      }
    }

    return action;
  },
  stateTransformer: (state) => {
    // Omit files and drastically slim down components
    const transformedState = {
      ...state,
      components: mapValues(
        state.components,
        c => ({ id: c.id, type: c.type, children: c.children, truncated: true })
      ),
      files: {
        ...state.files,
        files: stripFileContent(state.files.files),
      }
    }

    // Do save current component
    const openComponent = state.componentDetail?.viewProps?.id
    if (openComponent) {
      transformedState.components[openComponent] = state.components[openComponent]
    }

    return transformedState
  }
})

// Store definition ------------------------------------------------------------

const configureStore = async initialState =>
  createStore(
    reducer,
    initialState || await fromURL() || await retrieveState(),
    composeWithDevTools(sentryReduxEnhancer),
  )

export default configureStore
