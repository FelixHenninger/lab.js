import { downloadStatic } from '../index'
import { makeFilename } from '../../filename'

export const addDownloadPlugin = (state) => {
  // Add download plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    {
      type: 'lab.plugins.Download',
      filePrefix: makeFilename(state),
    },
  ]

  return state
}

export default state => downloadStatic(state, addDownloadPlugin)
