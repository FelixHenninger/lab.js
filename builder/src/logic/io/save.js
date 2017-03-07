import { pick } from 'lodash'
import { nestedChildren } from '../tree'

export const stateToJSON = (state, rootId='root') => {
  const { components: allComponents, files } = state

  // From all available components,
  // pick only those nested below the
  // designated root component
  const components = pick(
    allComponents,
    nestedChildren(rootId, allComponents)
  )
  // TODO: This assumes that there
  // cannot be a non-root component
  // named 'root'. This is reasonable,
  // but ideally there should be a
  // proper renaming step here.
  components['root'] = allComponents[rootId]
  components['root'].id = 'root'

  return JSON.stringify({
    version: [2017, 0, 4],
    components,
    files,
  }, null, 2)
}

import moment from 'moment'
import FileSaver from 'file-saver'

export const stateToDownload = (state, rootComponent='root',
  fileprefix='study', filenameOverride=null) => {
  const stateJSON = stateToJSON(state, rootComponent)

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
