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
    c => c.map(f => f[0].file)
  )
}

export const addEmbeddedFile = (store, fileContent, file) => {
  // Compute (user-changable) file path and
  // (internal) file name
  const fileHash = sha256().update(fileContent).digest('hex')
  const fileExtension = file.name.split('.').pop()
  const filePath = `embedded/${ fileHash }.${ fileExtension }`

  // Add file to global file repository
  store.dispatch({
    type: 'ADD_FILE',
    file: filePath,
    data: {
      content: fileContent,
      source: 'embedded',
      checkSum: fileHash,
    }
  })

  return {
    file: file,
    path: filePath,
    extension: fileExtension,
    content: fileContent,
  }
}
