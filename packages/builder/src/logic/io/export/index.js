import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import * as Sentry from '@sentry/browser'

import assemble from '../assemble'
import { readDataURI } from '../../util/dataURI'
import { makeFilename } from '../filename'

const createZip = async ({ files, bundledFiles }) => {
  const zip = new JSZip()

  const addFile = ([filename, payload]) => {
    const { data, base64 } = readDataURI(payload.content)
    zip.file(filename, data, { base64 })
  }

  // Include study-specific static files
  Object.entries(files).forEach(addFile)

  await Promise.all(
    // Add library static files to bundle
    Object.entries(bundledFiles).map(
      ([path, data]) =>
        fetch(`${ process.env.PUBLIC_URL }/api/_defaultStatic/${ data.source }`)
          .then(data => zip.file(path, data.blob()))
    )
  )

  // Generate zip file and return blob
  return await zip.generateAsync({ type: 'blob' })
}

export const downloadZip = async (data, filename='study_export.zip') => {
  // Generate blob and save file
  try {
    const blob = await createZip(data, filename)
    return saveAs(blob, filename)
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag('scope', 'export')
      Sentry.captureException(error)
    })
    alert(`Couldn't export bundle: ${ error }`)
  }
}

export const createStaticBlob = (state,
  stateModifier=state => state,
  options
) =>
  createZip(
    assemble(state, stateModifier, options),
  )

// Bundle all files into a zip archive
export const downloadStatic = (state,
  stateModifier=state => state,
  options
) =>
  downloadZip(
    assemble(state, stateModifier, options),
    makeFilename(state) + '-export.zip'
  )

