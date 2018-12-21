import JSZip from 'jszip'
import FileSaver from 'file-saver'
import Raven from 'raven-js'

import assemble from '../assemble'
import { readDataURI } from '../../util/dataURI'
import { makeFilename } from '../filename'

const createZip = ({ files, bundledFiles }) => {
  const zip = new JSZip()

  const addFile = ([filename, payload]) => {
    const { data, base64 } = readDataURI(payload.content)
    zip.file(filename, data, { base64 })
  }

  // Include study-specific static files
  Object.entries(files).forEach(addFile)

  return Promise.all(
    // Add library static files to bundle
    Object.entries(bundledFiles).map(
      ([path, data]) =>
        fetch(`${ process.env.PUBLIC_URL }/api/_defaultStatic/${ data.source }`)
          .then(data => zip.file(path, data.blob()))
    )
  ).then(
    // Generate zip file and return blob
    () => zip.generateAsync({ type: 'blob' })
  )
}

export const downloadZip = (data, filename='study_export.zip') =>
  // Generate blob and save file
  createZip(data, filename)
    .then(blob => FileSaver.saveAs(blob, filename))
    .catch(
      e => {
        Raven.captureException(e)
        alert(`Couldn't export bundle: ${ e }`)
      }
    )

export const createStaticBlob = (state, stateModifier=state => state,
  additionalFiles={}) =>
  createZip(
    assemble(state, stateModifier, additionalFiles),
  )

// Bundle all files into a zip archive
export const downloadStatic = (state, stateModifier=state => state,
  additionalFiles={}) =>
  downloadZip(
    assemble(state, stateModifier, additionalFiles),
    makeFilename(state) + '-export.zip'
  )

