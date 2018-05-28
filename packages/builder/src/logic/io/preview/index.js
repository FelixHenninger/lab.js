import Raven from 'raven-js'

import assemble from '../assemble'
import { blobFromDataURI } from '../../util/dataURI'

const cacheName = 'labjs-preview'

// Prepare cache when builder is loaded ----------------------------------------

// Add default static files to cache directly
const bundledFiles = [
  'lib/lab.css',
  'lib/lab.js',
  'lib/lab.js.map',
  'lib/lab.legacy.js',
  'lib/lab.legacy.js.map',
  'lib/lab.fallback.js',
  'lib/loading.svg',
]

export const prePopulateCache = () =>
  caches.open(cacheName).then(
    cache => cache.addAll(
      bundledFiles.map(
        path => `${ process.env.PUBLIC_URL }/api/_defaultStatic/${ path }`
      )
    )
  )

// Generate study preview ------------------------------------------------------

// Drop a single file into cache
// (cache passed as an object)
const putFile = (cache, [path, { content, type }], previewPath) =>
  cache.put(
    new Request(`/api/${ previewPath }/${ path }`),
    new Response(blobFromDataURI(content)),
  )

// Create link to default static files in preview location
const linkStatic = (cache, [path, data], previewPath) =>
  cache.match(`/api/_defaultStatic/${ path }`)
    .then(response => cache.put(
      new Request(`/api/${ previewPath }/${ path }`),
      response
    ))

// Setup study preview
export const populateCache = (state, stateModifier,
  previewPath='labjs_preview') => {

  return caches.open(cacheName).then(cache =>
    // Empty cache, except for copy of library static files
    cache.keys().then(keylist => Promise.all(
      keylist.map(
        // TODO: Think about filtering using
        // the bundledFiles array above
        key => !key.url.includes('_defaultStatic') ? cache.delete(key) : null
      )
    )).then(() => cache)
  ).then(cache => {
    const study = assemble(state, stateModifier)

    // Place generated study files into the cache
    return Promise.all([
      ...Object.entries(study.files)
        .map(file => putFile(cache, file, previewPath)),
      // Update links to static library files
      ...Object.entries(study.bundledFiles)
        .map(path => linkStatic(cache, path, previewPath))
    ])
  }).then(
    () => console.log('Preview cache updated successfully')
  ).catch(
    error => {
      Raven.captureException(error)
      console.log(`Error during preview cache update: ${ error }`)
    }
  )
}
