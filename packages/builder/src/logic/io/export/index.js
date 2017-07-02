import JSZip from 'jszip'
import FileSaver from 'file-saver'
import Raven from 'raven-js'

import assemble from '../assemble'
import { readDataURI } from '../../util/dataURI'

export const downloadZip = ({ files, bundledFiles }) => {
  const zip = new JSZip()

  const addFile = ([filename, payload]) => {
    const { data, base64 } = readDataURI(payload.content)
    zip.file( filename, data, { base64 } )
  }

  // Include study-specific static files
  Object.entries(files).forEach(addFile)

  Promise.all(
    // Add library static files to bundle
    Object.entries(bundledFiles).map(
      ([path, data]) =>
        fetch(`${ process.env.PUBLIC_URL }/api/_defaultStatic/${ data.source }`)
          .then(data => zip.file(path, data.blob()))
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

// Bundle all files into a zip archive
export const exportStatic = (state, stateModifier=state => state,
  additionalFiles={}) => {
  downloadZip(assemble(state, stateModifier, additionalFiles))
}

