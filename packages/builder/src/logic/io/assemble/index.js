import { cloneDeep, fromPairs } from 'lodash'
import { makeScript } from './script.js'
import { makeDataURI } from '../../util/dataURI'

const assemble = (state, stateModifier=state => state, additionalFiles={}) => {
  // Apply modification function to copy of current state
  const updatedState = stateModifier(cloneDeep(state))

  // Reassemble state object that now includes the generated script,
  // as well as any additional files required for the deployment target
  return {
    files: {
      'script.js': {
        content: makeDataURI(
          makeScript(updatedState),
          'application/javascript',
        )
      },
      ...updatedState.files.files,
      ...additionalFiles,
    },
    bundledFiles: fromPairs(Object.entries(updatedState.files.bundledFiles).map(
      // Add source path to data, so that bundled files can be moved
      ([path, data]) => [path, { source: path, ...data }]
    ))
  }
}

export default assemble
