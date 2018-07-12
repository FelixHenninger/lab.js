import parseAuthor from 'parse-author'
import { stripIndent } from 'common-tags'
import { repeat } from 'lodash'
import { makeFilename } from '../../filename'
import assemble from '../../assemble'
import { downloadZip } from '../index'
import { makeDataURI } from '../../../util/dataURI'
import { transform } from 'lodash'

// Reduce array of authors to 'a, b, and c' format
let reduceAuthors = (curr, next, i, a) => {
  switch (i) {
    case 0:
      return next
    case a.length - 1:
      if (a.length === 2) {
        return curr + ' and ' + next
      } else {
        return curr + ', and ' + next
      }
    default:
      return curr + ', ' + next
  }
}

const makeReadme = (state) => {
  const metadata = state.components.root.metadata
  const credits = metadata.contributors
    ? metadata.contributors
        .split('\n')
        .map(c => parseAuthor(c))
        .map(c => c.url ? `[${ c.name }](${ c.url })` : `${ c.name }`)
        .reduce(reduceAuthors)
    : 'excellent folks'

  const data = stripIndent`
    ${ metadata.title || 'Study' }
    ${ repeat('=', metadata.title ? metadata.title.length : 5) }
    ${ metadata.description ? `
    ${ metadata.description }
    ----
    ` : '' }
    Built by ${ credits } with [lab.js](https://lab.js.org)
  `

  return makeDataURI(data)
}

const makeConfig = (state) => {
  const metadata = state.components.root.metadata

  const data = {
    name: metadata.title,
    exp_id: makeFilename(state),
    url: metadata.repository,
    description: metadata.description,
    contributors: metadata.contributors
      .split('\n').map(c => c.trim()),
    template: 'lab.js',
    instructions: '',
    time: 5,
  }

  return makeDataURI(JSON.stringify(data, null, 2))
}

const addTransmitPlugin = (state) => {
  // Add data transmission
  state.components.root.plugins = [
    ...state.components.root.plugins,
    {
      type: 'lab.plugins.Transmit',
      url: '/save',
      updates: {
        incremental: false,
      },
      callbacks: {
        full: function(response) {
          if (response && response.ok) {
            window.location = '/next'
          }
        }
      },
      headers: {
        'X-CSRFToken': window.csrf_token,
      },
    },
  ]

  return state
}

export default (state) => {
  const files = assemble(state, addTransmitPlugin) // additionalFiles

  // Add packaged files
  files.files['readme.md'] = { content: makeReadme(state) }
  files.files['config.json'] = { content: makeConfig(state) }

  // Move all generated files into a folder
  const expId = makeFilename(state)
  const moveFile = (result, file, path) => {
    result[`${ expId }/${ path }`] = file
    return result
  }

  files.bundledFiles = transform(files.bundledFiles, moveFile, {})
  files.files = transform(files.files, moveFile, {})

  downloadZip(files)
}
