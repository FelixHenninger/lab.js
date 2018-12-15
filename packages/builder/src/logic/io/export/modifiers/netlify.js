import { createStaticBlob } from '../index'
import { makeDataURI, readDataURI } from '../../../../logic/util/dataURI'
import { stripIndent } from 'common-tags'

const form = `
  <form name="labjs-data" netlify netlify-honeypot="bot-field" hidden>
    <input name="bot-field">
    <input type="text" name="dataRaw" />
    <input type="file" name="dataFile" />
  </form>\n</body>`

const addSubmissionForm = (state) => {
  // Extract content of study's HTML file
  const { data: index, mime } = readDataURI(
    state.files.files['index.html'].content
  )

  // Add form to HTML file and replace file content
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

const makeRedirects = ({ site }) => makeDataURI(stripIndent`
  # Enforce HTTPS for subdomain url
  http://${ site }   https://${ site }          301
  http://${ site }/* https://${ site }/:splat   301

  # Rewrite paths to create multi-site entries
  /e/:entry   /e/:entry/index.html              302
  /e/:entry/* /:splat                           200
`)

export default (state, options) =>
  createStaticBlob(
    state,
    addSubmissionForm,
    {
      '_redirects': { content: makeRedirects(options) }
    },
  )
