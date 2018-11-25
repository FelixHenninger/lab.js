import { flatMap } from 'lodash'

export const embeddedFiles = components => {
  // Collect files embedded in components
  // (extract files from component file setting,
  // and the file URL from there)
  const componentFiles = Object.entries(components)
    .map(([_, { files }]) => files && files.rows ? files.rows : [])
    .filter(files => files.length > 0)

  return flatMap(
    componentFiles,
    c => c.map(f => f[0].file)
  )
}
