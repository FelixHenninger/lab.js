import { pick } from 'lodash'
import { nestedChildren } from '../tree'

export const stateToJSON = (state, exportedComponent='root') => {
  const { components: allComponents, files } = state

  // From all available components,
  // include only the root, and those
  // nested below any exported component
  const components = pick(
    allComponents,
    [
      'root', // Include root in any case
      exportedComponent, // Additionally, include exported component (or root)
      ...nestedChildren(exportedComponent, allComponents) // Add children
    ]
  )

  // Per default, include all children
  // of the root component as before.
  // If a component is exported, make it
  // the single child of the root component.
  components['root'].children = exportedComponent === 'root'
    ? allComponents['root'].children
    : [ exportedComponent ]

  return JSON.stringify({
    version: [2017, 1, 0],
    components,
    files,
  }, null, 2)
}

import moment from 'moment'
import FileSaver from 'file-saver'

export const stateToDownload = (state, exportedComponent='root',
  fileprefix='study', filenameOverride=null) => {
  const stateJSON = stateToJSON(state, exportedComponent)

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
