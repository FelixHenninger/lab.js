// Worker initialisation -------------------------------------------------------

const root = self.location.href
  .split('/')
  .slice(0, -1) // Remove last path component
  .join('/')

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.resolve()
      .then( () => console.log(`Preview worker installed at ${ root }`) )
      .then(
        // Make the worker the active service worker,
        // also triggering the activate event
        () => self.skipWaiting()
      )
      .catch(
        error => {
          console.log('Error during preview worker installation', error)
          throw error
        }
      )
  )
})

// Claim this worker as the active worker for all clients,
// as per https://serviceworke.rs/immediate-claim.html
self.addEventListener('activate', event => {
  console.log('Activating preview worker')
  return self.clients.claim()
})

// Request handling ------------------------------------------------------------

self.addEventListener('fetch', event => {
  // Limit preview worker to urls are nested under the root URL
  if (event.request.url.startsWith(root)) {
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
  }
})
