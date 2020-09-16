import { mapValues, omit } from 'lodash'
import { makeDataURI, updateDataURI } from '../util/dataURI'
import { stripIndent } from 'common-tags'

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
  '2017.1.4': data => {
    // Add study metadata
    data.components['root'].metadata = data.components['root'].metadata || {
      title: '',
      description: '',
      repository: '',
      contributors: '',
    }
    data.version = [2017, 1, 5]

    return data
  },
  '2017.1.5': data => {
    // Move message handlers bound to the 'prepare' message
    // to 'after:prepare' instead to make temporal order clearer
    data.components = mapValues(data.components, c => {
      if (c.messageHandlers && c.messageHandlers.rows) {
        c.messageHandlers.rows = c.messageHandlers.rows.map(r => ([{
          ...r[0],
          // Replace 'prepare' with 'after:prepare'
          message: r[0].message === 'prepare' ? 'after:prepare' : r[0].message,
        }]))
      }
      return c
    })

    data.version = [2017, 1, 6]

    return data
  },
  '2017.1.6': data => ({
    ...data,
    version: [2017, 1, 7],
    // Add parameters option to every component
    components: mapValues(data.components, c => ({
      ...c,
      parameters: { rows: [ [ { name: '', value: '', type: 'string' }, ], ], },
    })),
  }),
  '2017.1.7': data => {
    data.version = [2018, 0, 1]

    if (data.files.files['index.html']) {
      // Add fallback script
      data.files.files['index.html'].content =
        updateDataURI(
          data.files.files['index.html'].content,
          x => x.replace(
            /^(\s*)<script src="lib\/lab\.js"><\/script>/mg,
            '$&\n' +
            '$1<script src="lib/lab.fallback.js" data-labjs-script="fallback"></script>',
          )
        )

      // Add data-labjs-script property
      data.files.files['index.html'].content =
        updateDataURI(
          data.files.files['index.html'].content,
          x => x.replace(
            '<script src="lib/lab.js"></script>',
            '<script src="lib/lab.js" data-labjs-script="library"></script>',
          )
        )
    }

    return data
  },
  '2018.0.1': data => {
    data.version = [2018, 0, 2]

    // Add fallback and legacy library versions
    data.files.bundledFiles['lib/lab.fallback.js'] =
      { type: 'application/javascript' }
    data.files.bundledFiles['lib/lab.legacy.js'] =
      { type: 'application/javascript' }
    data.files.bundledFiles['lib/lab.legacy.js.map'] =
      { type: 'text/plain' }

    return data
  },
  '2018.0.2': data => {
    data.version = [2018, 0, 3]

    data.components = mapValues(data.components, c => {
      if (c._tab && c._tab === 'Responses') {
        c._tab = 'Behavior'
      }
      return c
    })

    return data
  },
  '2018.0.3': data => {
    data.version = [2018, 0, 4]

    const defaultHeader = new RegExp(stripIndent`
      ^\\s+<!-- lab.js library and default styles -->$
      ^\\s+<script [^>]* data-labjs-script="library"></script>$
      ^\\s+<script [^>]* data-labjs-script="fallback"></script>$
      ^\\s+<link rel="stylesheet" href="lib/lab.css">$
      ^\\s+<!-- study code and styles -->$
      ^\\s+<script defer src="script.js"></script>$
      ^\\s+<link rel="stylesheet" href="style.css">$
    `, 'gm')

    const newHeader = stripIndent`
      <!-- lab.js library and experiment code -->
      \${ header }
    `.split('\n').map(l => `  ${ l }`).join('\n')

    // Insert header as a template placeholder
    data.files.files['index.html'].content =
      updateDataURI(
        data.files.files['index.html'].content,
        fileContent => fileContent.replace(
          defaultHeader,
          newHeader,
        )
      )

    return data
  },
  '2018.0.4': data => ({
    ...data,
    version: [2018, 1, 0],
    // Add files option to every component
    components: mapValues(data.components, c => ({
      ...c,
      files: c.files || { rows: [] },
    })),
  }),
  '2018.1.0': data => {
    // Note source for files
    Object.entries(data.files.files).forEach(([filename, payload]) => {
      if (payload.permanent) {
        data.files.files[filename].source = 'library'

        // Remove permanent attribute
        delete data.files.files[filename].permanent
      } else {
        // All other files (at the moment) must
        // have been embedded globally
        data.files.files[filename].source = 'embedded-global'
      }
    })

    data.version = [2018, 1, 1]
    return data
  },
  '2018.1.1': data => ({
    ...data,
    version: [2018, 1, 2],
    // Improve Naming of component-level embedded files
    components: mapValues(data.components, c => ({
      ...c,
      files: c.files
        ? { rows: c.files.rows.map(
          f => [{ localPath: f[0].path, poolPath: f[0].file }]
        ) }
        : undefined,
    })),
  }),
  '2018.1.2': data => ({
    ...data,
    version: [19, 0, 0],
    // Rework shuffle and sample options
    components: mapValues(data.components, c => {
      if (c.type === 'lab.flow.Loop') {
        c.sample = c.sample || {}
        if (['', undefined].includes(c.sample.n)) {
          if (c.shuffle) {
            c.sample.mode = 'draw-shuffle'
          } else {
            c.sample.mode = 'sequential'
          }
        } else {
          if (c.sample.replace) {
            c.sample.mode = 'draw-replace'
          } else {
            c.sample.mode = 'draw-shuffle'
          }
        }
        // Deprecated options
        delete c.sample.replace
        delete c.shuffle

        return c
      } else {
        return c
      }
    }),
  }),
  '19.0.0': data => ({
    ...data,
    version: [19, 0, 1],
    components: mapValues(data.components, c => {
      if (c.timeline && Array.isArray(c.timeline)) {
        c.timeline = c.timeline.map(i => ({
          // Only save position data at the top level ...
          type: i.type,
          start: i.start,
          stop: i.stop,
          priority: i.priority,
          // ... everything else goes in the payload
          payload: omit(
            { ...i, ...i.options },
            ['type', 'start', 'stop', 'priority', 'options'],
          ),
        }) )
      }
      return c
    })
  }),
  '19.0.1': data => ({
    ...data,
    version: [19, 1, 0],
  }),
  '19.1.0': data => ({
    ...data,
    version: [19, 1, 1],
    components: mapValues(data.components, (c, id) => {
      if (id === 'root' && c.messageHandlers && c.messageHandlers.rows) {
        // Filter JATOS integrations that leaked from export into study
        c.messageHandlers.rows = c.messageHandlers.rows.filter(
          r => r[0].title !== "JATOS integration" &&
            r[0].message !== "epilogue"
        )
      }
      return c
    })
  }),
  '19.1.1': data => ({
    // Replace explicit use of Times New Roman with generic serif font
    ...data,
    version: [19, 1, 2],
    components: mapValues(data.components, c => {
      if (c.type === 'lab.canvas.Screen') {
        return {
          ...c,
          content: c.content.map(content => {
            if (
              content.type === 'i-text' &&
              content.fontFamily === 'Times New Roman'
            ) {
              return {
                ...content,
                fontFamily: 'serif',
              }
            } else {
              return content
            }
          })
        }
      } else {
        return { ...c }
      }
    })
  }),
  '19.1.2': data => ({
    ...data,
    version: [20, 0, 0],
  }),
  '20.0.0': data => ({
    ...data,
    version: [20, 0, 1],
  }),
  '20.0.1': data => ({
    ...data,
    version: [20, 1, 0],
  }),
  // Dummy version, never published as stable release
  '20.0.2': data => ({
    ...data,
    version: [20, 1, 0],
  }),
  '20.1.0': data => ({
    ...data,
    version: [20, 1, 1],
  }),
  '20.1.1': data => ({
    ...data,
    version: [20, 2, 0],
    components: mapValues(data.components, (c, id) => {
      return {
        ...c,
        parameters: c.parameters?.rows?.map(r => r[0]) ?? [],
        messageHandlers: c.messageHandlers?.rows?.map(r => r[0]) ?? [],
        files: c.files?.rows?.map(r => r[0]) ?? [],
        responses: c.responses?.rows?.map(r => ({
          label: r[0], event: r[1],
          target: r[2], filter: r[3],
        }))
      }
    })
  }),
  '20.2.0': data => ({
    // Upgrade page components
    ...data,
    version: [20, 2, 1],
    components: mapValues(data.components, (c, id) => {
      if (c.type === 'lab.html.Page') {
        return {
          ...c,
          items: c.items?.rows?.map(r => r[0]) ?? [],
        }
      } else {
        return c
      }
    })
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
