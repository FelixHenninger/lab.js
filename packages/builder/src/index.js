import React from 'react'
import ReactDOM from 'react-dom'

// Why did you (re)render?
import './wdyr.js'

// React-redux integration
import { Provider as ReduxProvider } from 'react-redux'
import configureStore from './store'

// React-dnd integration
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// App content
import App from './components/App'
import './index.css'

// Sentry error reporting for production releases
// (if a DSN is specified as an environment parameter, that is)
import * as Sentry from '@sentry/react'

if (
  process.env.NODE_ENV === 'production' &&
  process.env.REACT_APP_SENTRY_DSN
) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: `@lab.js:builder@${ process.env.REACT_APP_SENTRY_RELEASE }`,
    normalizeDepth: 10,
  })
}

///* eslint-disable import/first */
import { check } from './logic/util/compatibility'
import { persistState } from './logic/util/persistence'
import installPreviewWorker from './logic/io/preview/worker'
import { register as registerServiceWorker } from './registerServiceWorker'
import { SystemContextProvider } from './components/System'
///* eslint-enable import/first */

(async () => {
  const store = await configureStore()

  // Check browser compatibility
  check(store)

  // Persist store to localFtorage
  await persistState(store)

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
      Sentry.withScope((scope) => {
        scope.setTag('scope', 'worker')
        Sentry.captureException(e)
      })
    }
  } finally {
    // Render wrapped app
    ReactDOM.render(
      <SystemContextProvider
        value={{
          previewActive
        }}
      >
        <ReduxProvider store={ store }>
          <DndProvider backend={ HTML5Backend }>
            <App />
          </DndProvider>
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





