import { cloneDeep, pick, mapValues, omitBy, pickBy } from 'lodash'
import moment from 'moment'
import { saveAs } from 'file-saver'

import { children } from '../tree'
import { makeFilename } from './filename'
import { embeddedFiles } from '../util/files'

export const stateToJSON = (state, exportedComponent='root',
  { removeInternals=false }={}) => {
  const { version, components: allComponents,
    files: { files: allFiles, bundledFiles }} = state

  // From all available components,
  // include only the root, and those
  // nested below any exported component
  const components = cloneDeep(pick(
    allComponents,
    [
      'root', // Include root in any case
      exportedComponent, // Additionally, include exported component (or root)
      ...children(exportedComponent, allComponents) // Add children
    ]
  ))

  // Per default, include all children
  // of the root component as before.
  // If a component is exported, make it
  // the single child of the root component.
  components['root'].children = exportedComponent === 'root'
    ? allComponents['root'].children
    : [ exportedComponent ]

  // Remove internal options relating to UI state
  // (that start with an underscore)
  const filteredComponents = !removeInternals
    ? components
    : mapValues(components, c => omitBy(c, (v, k) => k.startsWith('_')))

  // Save only files that are embedded
  const filesInUse = embeddedFiles(filteredComponents)

  const files = pickBy(
    allFiles,
    (file, filename) =>
      file.source !== 'embedded' ||
      filesInUse.includes(filename)
  )

  return JSON.stringify({
    components: filteredComponents,
    version,
    files: {
      files,
      bundledFiles,
    },
  }, null, 2)
}

export const stateToDownload = (state, { exportedComponent='root',
  filenameOverride=null, removeInternals=false }={}) => {
  const stateJSON = stateToJSON(state, exportedComponent, { removeInternals })

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
  return saveAs(output, filename)
}
