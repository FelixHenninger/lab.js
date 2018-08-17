import { cloneDeep, fromPairs } from 'lodash'
import { makeDataURI } from '../../util/dataURI'
import { makeScript } from './script.js'
import { makeHTML } from './html.js'

const assemble = (state, stateModifier=state => state, additionalFiles={}) => {
  // Apply modification function to copy of current state
  const updatedState = stateModifier(cloneDeep(state))

  // Reassemble state object that now includes the generated script,
  // as well as any additional files required for the deployment target
  return {
    files: {
      // Static files stored in state
      ...updatedState.files.files,
      // Additional files injected by the export modifier
      ...additionalFiles,
      // Generated experiment files
      'script.js': {
        content: makeDataURI(
          makeScript(updatedState),
          'application/javascript',
        )
      },
      'index.html': {
        content: makeDataURI(
          makeHTML(updatedState),
          'text/html'
        )
      },
    },
    bundledFiles: fromPairs(Object.entries(updatedState.files.bundledFiles).map(
      // Add source path to data, so that bundled files can be moved
      ([path, data]) => [path, { source: path, ...data }]
    ))
  }
}

export default assemble
