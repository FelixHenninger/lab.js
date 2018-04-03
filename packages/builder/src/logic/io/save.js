import { pick } from 'lodash'
import moment from 'moment'
import FileSaver from 'file-saver'

import { nestedChildren } from '../tree'
import { makeFilename } from './filename';

export const stateToJSON = (state, exportedComponent='root') => {
  const { version, components: allComponents, files } = state

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
    version,
    components,
    files,
  }, null, 2)
}

export const stateToDownload = (state, exportedComponent='root',
  filenameOverride=null) => {
  const stateJSON = stateToJSON(state, exportedComponent)

  // Determine filename if not set explicitly
  let filename
  if (!filenameOverride) {
    const fileprefix = exportedComponent === 'root'
      ? makeFilename(state)
      : makeFilename(state) + '-' +
        state.components[exportedComponent].title.toLowerCase()
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
