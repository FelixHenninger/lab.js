// Worker initialisation -------------------------------------------------------

const root = self.location.href
  .split('/')
  .slice(0, -1) // Remove last path component
  .join('/')

self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log(`Preview worker installed at ${ root }`)
      }).then(() => {
        // Make the worker the active service worker,
        // also triggering the activate event
        self.skipWaiting()
      }).catch(error => {
        console.log('Error during preview worker installation', error)
        throw error
      })
  )
})

// Claim this worker as the active worker for all clients,
// as per https://serviceworke.rs/immediate-claim.html
self.addEventListener('activate', function(event) {
  console.log('Activating preview worker')
  return self.clients.claim()
})

// Request handling ------------------------------------------------------------

self.addEventListener('fetch', function(event) {
  const url = event.request.url.replace(root, 'https://study.local')
  console.log(`Retrieving ${ url } through preview worker`)

  event.respondWith(
    caches.open('labjs-preview')
      .then(cache => cache.match(new Request(url)))
  )
})
