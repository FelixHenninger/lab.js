// Worker initialisation -------------------------------------------------------

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.resolve()
      .then( () => console.log('Service worker installed at', self.location) )
      .then(
        // Make the worker the active service worker,
        // also triggering the activate event
        () => self.skipWaiting()
      )
      .catch(
        error => {
          console.log('Error during service worker installation', error)
          throw error
        }
      )
  )
})

// Claim this worker as the active worker for all clients,
// as per https://serviceworke.rs/immediate-claim.html
self.addEventListener('activate', event => {
  console.log('Activating service worker')
  return self.clients.claim()
})

// Request handling ------------------------------------------------------------

self.addEventListener('fetch', event => {
  console.log(`Retrieving ${ event.request.url } through preview worker`)

  event.respondWith(
    caches
      // Open cache
      .open('labjs-preview')
      // Match response against cache contents
      .then( cache => cache.match(event.request) )
      // Respond
      .then( response => response || fetch(event.request) )
      .catch( error => {
        console.log(`Error in preview worker's fetch handler:`, error)
        throw error
      })
  )
})
