import { cloneDeep, pick, mapValues, omitBy, flatMap, pickBy } from 'lodash'
import moment from 'moment'
import FileSaver from 'file-saver'

import { children } from '../tree'
import { makeFilename } from './filename';

export const stateToJSON = (state, exportedComponent='root',
  { removeInternals=false }={}) => {
  const { version, components: allComponents, files: allFiles } = state

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

  // Collect files embedded in components
  // (extract files from component file setting,
  // and the file URL from there)
  const componentFiles = Object.entries(filteredComponents)
    .map(([_, { files }]) => files && files.rows ? files.rows : [])
    .filter(files => files.length > 0)

  const embeddedFiles = flatMap(
    componentFiles,
    c => c.map(f => f[0].file)
  )

  // Filter files based on the above
  const files = pickBy(
    allFiles.files,
    (file, filename) =>
      file.source !== 'embedded' ||
      embeddedFiles.includes(filename)
  )

  return JSON.stringify({
    components: filteredComponents,
    version,
    files: { files },
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
  return FileSaver.saveAs(output, filename)
}
