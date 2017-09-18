import { mapValues } from 'lodash'
import { makeDataURI } from '../util/dataURI'

const updates = {
  '2017.0.1': data => ({
    ...data,
    version: [2017, 0, 2],
    // Add messageHandler property to all components
    components: mapValues(data.components, c => ({
      messageHandlers: {
        rows: [
          [ { title: '', message: '', code: '' }, ],
        ],
      },
      ...c,
    })),
  }),
  '2017.0.2': data => ({
    ...data,
    version: [2017, 0, 3],
    // Add column type to loop template parameters
    components: mapValues(data.components, c => {
      if (c.type === 'lab.flow.Loop') {
        return {
          ...c,
          templateParameters: {
            ...c.templateParameters,
            columns: c.templateParameters.columns.map(
              col => ({ name: col, type: 'string' })
            )
          },
        }
      } else {
        return {
          ...c,
        }
      }
    }),
  }),
  '2017.0.3': data => ({
    ...data,
    version: [2017, 0, 4],
    // Switch keynames to KeyEvent standard
    components: mapValues(data.components, c => {
      const newKeyValues = {
        'space': 'Space',
        'enter': 'Enter',
        'tab': 'Tab',
        'up': 'ArrowUp',
        'down': 'ArrowDown',
        'left': 'ArrowLeft',
        'right': 'ArrowRight',
      }

      if (c.responses && c.responses.rows) {
        c.responses.rows = c.responses.rows.map(r => {
          if (r[1] === 'keypress') {
            // Split and reassemble keys
            const newKeys = r[3]
              .split(',')
              .map(k => k.trim())
              .map(k => newKeyValues[k] || k)
              .join(', ')

            // Create new response entry
            const newRow = r
            newRow[3] = newKeys
            return newRow
          } else {
            return r
          }
        })
      }

      return c
    }),
  }),
  '2017.0.4': data => {
    if (data.files.files['index.html']) {
      data.files.files['index.html'].content =
        data.files.files['index.html'].content.replace(
          'id="labjs-content"',
          'data-labjs-section="main"',
        )
    }

    data.version = [2017, 0, 5]
    return data
  },
  '2017.0.5': data => ({
    ...data,
    version: [2017, 1, 0],
  }),
  '2017.1.0': data => {
    // Move library to lab.js (instead of lab.min.js),
    // include source map
    if (data.files.files['index.html']) {
      data.files.files['index.html'].content =
        data.files.files['index.html'].content.replace(
          'src="lib/lab.min.js"',
          'src="lib/lab.js"',
        )
    }

    if (data.files.bundledFiles['lib/lab.min.js']) {
      delete data.files.bundledFiles['lib/lab.min.js']
    }

    data.files.bundledFiles['lib/lab.js'] = { type: 'application/javascript' }
    data.files.bundledFiles['lib/lab.js.map'] = { type: 'text/plain' }

    data.version = [2017, 1, 1]
    return data
  },
  '2017.1.1': data => {
    // Convert files to data URIs and
    // mark internal files as permanent
    Object.entries(data.files.files).forEach(([filename, payload]) => {
      data.files.files[filename] = {
        content: makeDataURI(payload.content, payload.type)
      }
      if (['index.html', 'style.css'].includes(filename)) {
        data.files.files[filename].permanent = true
      }
    })

    data.version = [2017, 1, 2]
    return data
  },
  '2017.1.2': data => {
    // Add metadata plugin (and normalize
    // plugin setting, which may have been
    // altered in export postprocessing)
    data.components['root'].plugins = [
      {
        type: 'lab.plugins.Metadata'
      }
    ]
    data.version = [2017, 1, 3]

    return data
  },
  '2017.1.3': data => ({
    ...data,
    version: [2017, 1, 4],
    // Add viewport options to canvas.Screen
    components: mapValues(data.components, c => {
      if (c.type === 'lab.canvas.Screen') {
        return {
          ...c,
          viewport: [800, 600],
        }
      }

      return c
    }),
  }),
}

export default (data) => {
  let output = data

  while (output.version.join('.') in updates) {
    console.log(`Updating file from ${ output.version.join('.') }`)
    try {
      output = updates[output.version.join('.')](output)
    } catch (e) {
      console.log('found error', e)
    }
    console.log('update complete')
  }

  return output
}
