import React from 'react'
import ReactDOM from 'react-dom'

// React-redux integration
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './store'

// React-dnd integration
import { DragDropContext } from 'react-dnd'
import HTML5DragDropBackend from 'react-dnd-html5-backend'

// App content
import App from './components/App'
import './index.css'

// Raven / Sentry error reporting for production releases
// (if a DSN is specified as an environment parameter, that is)
import Raven from 'raven-js'

if (
  process.env.NODE_ENV === 'production' &&
  process.env.REACT_APP_RAVEN_DSN
) {
  Raven
    .config(process.env.REACT_APP_RAVEN_DSN)
    .install()
}

/* eslint-disable import/first */
import { check } from './logic/util/compatibility'
import { persistState } from './logic/util/persistence'
import installPreviewWorker from './logic/io/preview/worker'
import registerServiceWorker from './registerServiceWorker'
import { SystemContextProvider } from './components/System'
/* eslint-enable import/first */

(async () => {
  const store = await configureStore()

  // Check browser compatibility
  check(store)

  // Persist store to localStorage
  persistState(store)

  // Enable preview service worker
  let previewActive
  try {
    await installPreviewWorker(store)
    previewActive = true
  } catch (e) {
    console.log('Error during preview worker registration:', e)
    previewActive = false

    // A lack of service worker support is now well-captured
    // in the remaining app, and need not be logged
    if (e.message !== 'Service workers not available') {
      Raven.captureException(e)
    }
  } finally {
    // Wrap main app component
    const WrappedApp = DragDropContext(HTML5DragDropBackend)(App)

    // Render wrapped app
    ReactDOM.render(
      <SystemContextProvider
        value={{
          previewActive
        }}
      >
        <ReduxProvider store={ store }>
          <WrappedApp />
        </ReduxProvider>
      </SystemContextProvider>,
      document.getElementById('root')
    )

    // Setup progressive content caching
    // TODO: This doesn't work because the SW registration code
    // sets up a hook for the 'onload' event -- which has passed
    // by the time this function is run.
    // This is fixed in an existing pull request, so we'll either
    // have to wait, or move this code elsewhere, see
    // https://github.com/facebook/create-react-app/pull/3654
    registerServiceWorker()
  }
})()





