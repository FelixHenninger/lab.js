import { transform } from 'lodash'

import { makeFilename } from '../../filename'
import assemble from '../../assemble'
import { downloadZip } from '../index'

const addPavloviaPlugin = (state) => {
  // Add postMessage plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'global.Pavlovia' },
  ]

  return state
}

const headerOptions = {
  beforeHeader: [
    ['comment', { content: 'pavlovia.org dependencies' }],
    ['script', {
      type: 'text/javascript',
      src: 'lib/vendors/jquery-2.2.0.min.js',
    }],
    ['script', {
      type: 'text/javascript',
      src: 'lib/labjs-pavlovia-3.0.0.js',
    }],
  ],
  libraryPath: 'lab.js',
}

export default state => {
  const files = assemble(state, addPavloviaPlugin, { headerOptions })
  const fileName = makeFilename(state) + '-pavlovia.zip'

  // Move library files from /lib to a new path
  // (Pavlovia has reserved the lib path for its own library files)
  const moveFile = (result, file, path) => {
    result[path.replace(/^lib/, headerOptions.libraryPath)] = file
    return result
  }

  files.bundledFiles = transform(files.bundledFiles, moveFile, {})

  return downloadZip(files, fileName)
}
