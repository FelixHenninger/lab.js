import { prePopulateCache } from './index'

export default (store) => {
  if ('serviceWorker' in navigator) {
    // Compute root URL by removing filename from path, if present
    const rootUrl = window.location.pathname.substring(
      0, window.location.pathname.lastIndexOf('/') + 1
    ) + 'api/'

    // Register service worker
    return navigator.serviceWorker
      // Remove legacy workers during architectural transition
      .getRegistrations().then(registrations =>
        Promise.all(
          registrations.map( r => r.unregister() )
        )
      ).then(() =>
        // Setup new worker
        navigator.serviceWorker.register(
          process.env.PUBLIC_URL + '/api/worker.js', { scope: rootUrl }
        )
      ).then(() => {
        console.log(`Preview worker registered successfully at ${ rootUrl }`)

        // Prepopulate cache with library files
        prePopulateCache()

        return Promise.resolve()
      })
  } else {
    return Promise.reject(new Error('Service workers not available'))
  }
}
