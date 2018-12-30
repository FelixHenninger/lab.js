import { flatMap } from 'lodash'
import sha256 from 'hash.js/lib/hash/sha/256'

export const embeddedFiles = components => {
  // Collect files embedded in components
  // (extract files from component file setting,
  // and the file URL from there)
  const componentFiles = Object.entries(components)
    .map(([_, { files }]) => files && files.rows ? files.rows : [])
    .filter(files => files.length > 0)

  return flatMap(
    componentFiles,
    c => c.map(f => f[0].poolPath)
  )
}

export const addGlobalFile = (store, fileContent, file) => {
  // Compute (user-changable) file path and
  // (internal) file name
  const fileHash = sha256().update(fileContent).digest('hex')
  const fileExtension = file.name.split('.').pop()
  const poolPath = `embedded/${ fileHash }.${ fileExtension }`

  // Add file to global file repository
  store.dispatch({
    type: 'ADD_FILE',
    file: poolPath,
    data: {
      content: fileContent,
      source: 'embedded',
      checkSum: fileHash,
    }
  })

  return {
    file, poolPath,
    extension: fileExtension,
    content: fileContent,
  }
}

export const addLocalFile = (
  store, { component, localPath, poolPath }
) =>
  store.dispatch({
    type: 'ADD_COMPONENT_FILE',
    id: component,
    poolPath, localPath,
  })

export const getLocalFile = (store, componentId, localPath) => {
  const state = store.getState()

  if (state.components[componentId].files) {
    const localFile = state.components[componentId].files.rows
      .map(f => f[0]) // Remove nesting level
      .filter(f => f.localPath === localPath) // Choose file
      .pop() // Use the last match (arbitrarily)

    if (localFile) {
      // Look up file in global file store (by path)
      return {
        localPath,
        poolPath: localFile.poolPath,
        file: state.files.files[localFile.poolPath]
      }
    }
  }

  // File not found
  return undefined
}
