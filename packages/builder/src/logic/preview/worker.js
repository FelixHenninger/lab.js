import Raven from 'raven-js'
import { prePopulateCache } from './io'

export default (store) => {
  if ('serviceWorker' in navigator) {
    // Compute root URL by removing filename from path, if present
    const rootUrl = window.location.pathname.substring(
      0, window.location.pathname.lastIndexOf('/') + 1
    ) + 'api/'

    // Register service worker
    navigator.serviceWorker
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
      ).then(() =>
        console.log(`Service worker registered successfully at ${ rootUrl }`)
      ).catch(e => {
        console.log('Error during service worker registration:', e)
        Raven.captureException(e)
      })

    // Prepopulate cache with library files
    prePopulateCache()
  }
}
