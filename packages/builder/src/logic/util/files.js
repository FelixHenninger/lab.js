import { flatMap } from 'lodash'
import sha256 from 'hash.js/lib/hash/sha/256'

export const embeddedFiles = components => {
  // Collect files embedded in components
  // (extract files from component file setting,
  // and the file URL from there)
  const componentFiles = Object.entries(components)
    .map(([_, { files }]) => files || [])
    .filter(files => files.length > 0)

  return flatMap(
    componentFiles,
    c => c.map(f => f.poolPath)
  )
}

export const addFiles = (store, files=[]) => {
  // Normalize files for further processing and output
  const processedFiles = files.map(f => {
    if (
      !(f.poolPath && f.data && f.data.content) && // New global file
      !(f.component && f.localPath && f.poolPath) && // File import
      !(f.component && f.localPath && f.data && f.data.content) // Add local
    ) {
      // These errors should only ever result from programming mistakes
      console.log('Incomplete data for file', f)
      throw Error('Incomplete data for file', f)
    }

    let defaultPath = undefined
    let data = undefined

    if (f.data && f.data.content) {
      const fileHash = sha256().update(f.data.content).digest('hex')
      const fileExtension = (f.localPath || f.poolPath).split('.').pop()
      defaultPath = `embedded/${ fileHash }.${ fileExtension }`
      data = {
        content: f.data.content,
        source: f.data.source || 'embedded',
        checkSum: fileHash,
      }
    }

    return {
      poolPath: f.poolPath || defaultPath,
      localPath: f.localPath,
      component: f.component,
      data,
    }
  })

  store.dispatch({
    type: 'ADD_FILES',
    files: processedFiles,
  })

  return processedFiles
}

export const getLocalFile = (store, componentId, localPath) => {
  const state = store.getState()

  if (state.components[componentId].files) {
    const localFile = state.components[componentId].files
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
