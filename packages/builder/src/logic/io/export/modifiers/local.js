import { exportStatic } from '../index'

export const addDownloadPlugin = (state) => {
  // Add download plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'lab.plugins.Download' },
  ]

  return state
}

export default state => exportStatic(state, addDownloadPlugin)
