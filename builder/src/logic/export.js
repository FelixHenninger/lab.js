import moment from 'moment'
import FileSaver from 'file-saver'

export const stateToJSON = (state) => {
  const { components, files } = state
  return JSON.stringify({
    version: [2017, 0, 3],
    components,
    files,
  }, null, 2)
}

export const stateToDownload = (state, fileprefix='study', filenameOverride=null) => {
  const stateJSON = stateToJSON(state)

  // Determine filename if not set explicitly
  let filename
  if (!filenameOverride) {
    const timestamp = moment().format('YYYY-MM-DD--HH:mm')
    filename = `${ fileprefix }-${ timestamp }.study.json`
  } else {
    filename = filenameOverride
  }

  // Output JSON file
  const output = new Blob(
    [ stateJSON ],
    { type: 'application/json;charset=utf-8' }
  )
  return FileSaver.saveAs(output, filename)
}
