import * as Sentry from '@sentry/browser'

import assemble from '../assemble'
import { blobFromDataURI } from '../../util/dataURI'
import { quotaExceededErrors } from '../../util/monitoring'

const cacheName = 'labjs-preview'

// Prepare cache when builder is loaded ----------------------------------------

// Add default static files to cache directly
const bundledFiles = [
  'lib/lab.css',
  'lib/lab.dev.js',
  'lib/lab.js',
  'lib/lab.js.map',
  'lib/lab.legacy.js',
  'lib/lab.legacy.js.map',
  'lib/lab.fallback.js',
  'lib/loading.svg',
]

export const prePopulateCache = async () => {
  const cache = await caches.open(cacheName)
  await cache.addAll(
    bundledFiles.map(
      path => `${ process.env.PUBLIC_URL }/api/_defaultStatic/${ path }`
    )
  )
}

// Generate study preview ------------------------------------------------------

// Drop a single file into cache
// (cache passed as an object)
const putFile = async (cache, [path, { content, type }], previewPath) =>
  await cache.put(
    new Request(`/api/${ previewPath }/${ path }`),
    new Response(blobFromDataURI(content)),
  )

// Create link to default static files in preview location
const linkStatic = async (cache, [path, data], previewPath) => {
  // (load from cache if possible, otherwise fetch anew)
  const response = await cache.match(`/api/_defaultStatic/${ path }`) ??
    await fetch(`/api/_defaultStatic/${ path }`)

  await cache.put(
    new Request(`/api/${ previewPath }/${ path }`),
    response
  )
}

// Setup study preview
export const populateCache = async (state, stateModifier,
  assemblyOptions={}, previewPath='labjs_preview') => {
  const cache = await caches.open(cacheName)

  // Empty cache, except for copy of library static files
  await cache.keys().then(keylist => Promise.all(
    keylist.map(
      // TODO: Think about filtering using
      // the bundledFiles array above
      key => !key.url.includes('_defaultStatic') ? cache.delete(key) : null
    )
  ))

  try {
    const study = assemble(state, stateModifier, assemblyOptions)

    // Place generated study files into the cache
    await Promise.all([
      ...Object.entries(study.files)
        .map(file => putFile(cache, file, previewPath)),
      // Update links to static library files
      ...Object.entries(study.bundledFiles)
        .map(path => linkStatic(cache, path, previewPath)),
      // Copy development library version directly (TODO technical debt)
      linkStatic(cache,
        ['lib/lab.dev.js', { type: 'application/javascript', }],
        previewPath
      ),
    ])

    console.log('Preview cache updated successfully')
  } catch (e) {
    console.log(`Error during preview cache update: ${ e }`)
    if (quotaExceededErrors.some(message => e.message.includes(message))) {
      // TODO alert user
    } else {
      Sentry.withScope((scope) => {
        scope.setTag('scope', 'preview-cache')
        Sentry.captureException(e)
      })
      throw e
    }
  }
}
