import { cloneDeep, fromPairs } from 'lodash'
import { makeScript } from './script.js'
import { makeDataURI } from '../../util/dataURI'

const assemble = (state, stateModifier=state => state, additionalFiles={}) => ({
  files: {
    'script.js': {
      content: makeDataURI(
        makeScript(
          stateModifier(cloneDeep(state))
        ),
        'application/javascript',
      )
    },
    ...state.files.files,
    ...additionalFiles,
  },
  bundledFiles: fromPairs(Object.entries(state.files.bundledFiles).map(
    // Add source path to data, so that bundled files can be moved
    ([path, data]) => [path, { source: path, ...data }]
  ))
})

export default assemble
