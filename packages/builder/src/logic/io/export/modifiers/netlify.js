import { createStaticBlob } from '../index'
import { makeDataURI, readDataURI } from '../../../../logic/util/dataURI'

const form = `
  <form name="labjs-data" netlify netlify-honeypot="bot-field" hidden>
    <input name="bot-field">
    <input type="text" name="dataRaw" />
    <input type="file" name="dataFile" />
  </form>\n</body>`

const addSubmissionForm = (state) => {
  // Extract contents of study's HTML file
  const { data: index, mime } = readDataURI(
    state.files.files['index.html'].content
  )

  // Add form to HTML file and replace file contents
  state.files.files['index.html'].content = makeDataURI(
    index.replace('</body>', form),
    mime
  )

  // Add submission plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    { type: 'lab.plugins.Submit' },
  ]

  return state
}

export default state =>
  createStaticBlob(state, addSubmissionForm)
