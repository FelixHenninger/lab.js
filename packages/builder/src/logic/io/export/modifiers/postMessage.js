import { downloadStatic } from '../index'

const addPostMessagePlugin = (state) => {
  // Add postMessage plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'lab.plugins.PostMessage' },
  ]

  return state
}

export default state =>
  downloadStatic(state, addPostMessagePlugin)
