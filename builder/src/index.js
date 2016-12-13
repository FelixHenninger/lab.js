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

// Wrap main app component
const WrappedApp = DragDropContext(HTML5DragDropBackend)(App)

// Render wrapped app
ReactDOM.render(
  <Provider store={ store }>
    <WrappedApp />
  </Provider>,
  document.getElementById('root')
)
