import React from 'react'
import ReactDOM from 'react-dom/client'

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

if (import.meta.env.DEV) {
  const whyDidYouRender = await import(
    '@welldone-software/why-did-you-render'
  ).then(module => module.default)
  whyDidYouRender(React, { trackAllPureComponents: true, trackExtraHooks: [] })
}

if (import.meta.env.DEV && import.meta.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.REACT_APP_SENTRY_DSN,
    release: `@lab.js:builder@${import.meta.env.REACT_APP_SENTRY_RELEASE}`,
    normalizeDepth: 10,
  })
}

///* eslint-disable import/first */
import { check } from './logic/util/compatibility'
import { persistState } from './logic/util/persistence'
import installPreviewWorker from './logic/io/preview/worker'
import { SystemContextProvider } from './components/System'
///* eslint-enable import/first */

const store = await configureStore()

// Check browser compatibility
check(store)

// Persist store to localStorage
await persistState(store)

// Enable preview service worker
let previewActive
try {
  await installPreviewWorker(store)
  previewActive = true
} catch (e: any) {
  console.log('Error during preview worker registration:', e)
  previewActive = false
  // A lack of service worker support is now well-captured
  // in the remaining app, and need not be logged
  if (e.message !== 'Service workers not available') {
    Sentry.withScope(scope => {
      scope.setTag('scope', 'worker')
      Sentry.captureException(e)
    })
  }
} finally {
  // Render wrapped app
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <SystemContextProvider
      value={{
        previewActive,
      }}
    >
      <ReduxProvider store={store}>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </ReduxProvider>
    </SystemContextProvider>,
  )
}
