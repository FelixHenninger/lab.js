import { mapValues } from 'lodash'

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
}

export default (data) => {
  let output = data
  // console.log('input', data)
  while (output.version.join('.') in updates) {
    console.log(`Updating file from ${ output.version.join('.') }`)
    try {
      output = updates[output.version.join('.')](output)
    } catch (e) {
      console.log('found error', e)
    }
    console.log('update complete')
  }
  // console.log('output', output)
  return output
}
