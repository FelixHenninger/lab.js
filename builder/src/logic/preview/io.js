import Raven from 'raven-js'

const cacheName = 'labjs-preview'

// Drop a single file into cache
// (cache passed as an object)
const putFile = (cache, [path, { content, type }], previewPath) =>
  cache.put(
    new Request(`/api/${ previewPath }/${ path }`),
    new Response(
      content, {
      headers: new Headers({
        'Content-Type' : type,
      })
    }),
  )

// Drop a set of files into cache
// (cache specified by name)
const put = (cache, files, previewPath='labjs_preview') =>
  Promise.all(
    Object.entries(files).map( file => putFile(cache, file, previewPath) )
  )

// Create links to default static files
const linkStatic = (path, cache, previewPath='labjs_preview') =>
  cache.match(`/api/_defaultStatic/${ path }`)
    .then(response => cache.put(
      new Request(`/api/${ previewPath }/${ path }`),
      response
    ))

import { dynamicFiles, staticFiles } from '../io/export'

export const prePopulateCache = () =>
  // Add static files to cache directly
  caches.open(cacheName).then(
    cache => cache.addAll(
      staticFiles.map(
        path => `${ process.env.PUBLIC_URL }/api/_defaultStatic/${ path }`
      )
    )
  )

export const populateCache = (state, modifier) =>
  caches.open(cacheName).then(cache =>
    Promise.all([
      // Place generated study files into the cache
      put(cache, dynamicFiles(state, modifier)),
      // Update links to static library files
      ...staticFiles.map( path => linkStatic(path, cache) )
    ])
  ).then(
    () => console.log('Preview cache updated successfully')
  ).catch(
    error => {
      Raven.captureException(error)
      console.log(`Error during preview cache update: ${ error }`)
    }
  )
