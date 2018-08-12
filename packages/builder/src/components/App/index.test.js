import React from 'react'
import ReactDOM from 'react-dom'
import App from './'

import { Provider } from 'react-redux'
import configureStore from '../../store'

import { DragDropContext } from 'react-dnd'
import HTML5DragDropBackend from 'react-dnd-html5-backend'

// A fair amount of boilerplate code is necessary here
// to establish a context in which the app can run.
it('renders without crashing', async () => {
  const store = await configureStore()
  const WrappedApp = DragDropContext(HTML5DragDropBackend)(App)
  const div = document.createElement('div')
  // Temporary fix for reactstrap error,
  // see https://github.com/reactstrap/reactstrap/issues/773
  document.body.appendChild(div)
  ReactDOM.render(
    <Provider store={ store }>
      <WrappedApp />
    </Provider>,
    div
  )
})
