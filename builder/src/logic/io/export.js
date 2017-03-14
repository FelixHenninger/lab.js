import JSZip from 'jszip'
import FileSaver from 'file-saver'
import Raven from 'raven-js'

export const staticFiles = [
  'lib/lab.css',
  'lib/lab.min.js',
  'lib/loading.svg',
]

import { processStudy } from './build'

// Map paths onto file contents
// (and some metadata)
export const dynamicFiles = (state) => ({
  ...state.files.files,
  'script.js': {
    content: processStudy(state),
    type: 'application/javascript',
  }
})

// Bundle all files into a zip archive
export const exportStatic = (state) => {
  const zip = new JSZip()

  // Include static files specific to the study
  Object.entries(dynamicFiles(state)).forEach(
    ([filename, data]) => zip.file(filename, data.content)
  )

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
