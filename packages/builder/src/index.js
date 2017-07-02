import React from 'react'
import ReactDOM from 'react-dom'

// React-redux integration
import { Provider } from 'react-redux'
import store from './store'

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

// Check browser compatibility
// eslint-disable-next-line import/first
import { check } from './logic/util/compatibility'
check(store)

// Persist store to localStorage
// eslint-disable-next-line import/first
import { persistState } from './logic/util/persistence'
persistState(store)

// Enable preview service worker
// eslint-disable-next-line import/first
import installPreviewWorker from './logic/io/preview/worker'
installPreviewWorker(store)

// Wrap main app component
const WrappedApp = DragDropContext(HTML5DragDropBackend)(App)

// Render wrapped app
ReactDOM.render(
  <Provider store={ store }>
    <WrappedApp />
  </Provider>,
  document.getElementById('root')
)

// Setup progressive content caching
// eslint-disable-next-line import/first
import registerServiceWorker from './registerServiceWorker'
registerServiceWorker()
