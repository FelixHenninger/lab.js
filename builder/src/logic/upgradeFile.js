import { mapValues } from 'lodash'

const updates = {
  '2017.0.1': data => ({
    ...data,
    // Add messageHandler property to all components
    components: mapValues(data.components, c => ({
      messageHandlers: {
        rows: [
          [ { title: '', message: '', code: '' }, ],
        ],
      },
      ...c,
    })),
    version: [2017, 0, 2]
  })
}

export default (data) => {
  let output = data
  console.log('input', data)
  while (output.version.join('.') in updates) {
    console.log(`Updating file from ${ data.version.join('.') }`)
    try {
      output = updates[output.version.join('.')](output)

    } catch (e) {
      console.log('found error', e)
    }
    console.log('update complete')
  }
  console.log('output', output)
  return output
}
