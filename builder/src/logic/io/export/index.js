import JSZip from 'jszip'
import FileSaver from 'file-saver'
import Raven from 'raven-js'

// TODO: Rethink the data flows here.
// There should (ideally) be a single path for both
// preview and study export. The modifier function
// is a good idea, but it shouldn't be passed through
// the entire build process -- there should be an
// early clone at the entry point.

import { processStudy } from '../build'
import { makeDataURI, readDataURI } from '../../util/dataURI'

export const staticFiles = [
  'lib/lab.css',
  'lib/lab.js',
  'lib/lab.js.map',
  'lib/loading.svg',
]

// Map paths onto file contents
// (and some metadata)
export const dynamicFiles = (state, modifier) => ({
  ...state.files.files,
  'script.js': {
    content: makeDataURI(
      processStudy(state, modifier),
      'application/javascript',
    )
  }
})

// Bundle all files into a zip archive
export const exportStatic = (state, modifier, additionalFiles={}) => {
  const zip = new JSZip()

  const addFile = ([filename, payload]) => {
    const { data, base64 } = readDataURI(payload.content)
    zip.file( filename, data, { base64 } )
  }

  // Include standard set of files specific to the study
  Object.entries(dynamicFiles(state, modifier)).forEach(addFile)

  // Include additional files
  Object.entries(additionalFiles).forEach(addFile)

  // Include library static files
  Promise.all(
    // Fetch files
    staticFiles.map(
      file => fetch(`${ process.env.PUBLIC_URL }/api/_defaultStatic/${ file }`)
    )
  ).then(
    // Add (static) files to bundle
    responses => responses.map(
      (response, index) => zip.file(staticFiles[index], response.blob())
    )
  ).then(
    // Generate zip file and download bundle
    () => zip
      .generateAsync({ type: 'blob' })
      .then(blob => FileSaver.saveAs(blob, 'study_export.zip'))
  ).catch(
    e => {
      Raven.captureException(e)
      alert(`Couldn't export bundle: ${ e }`)
    }
  )
}
