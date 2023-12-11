import { prePopulateCache } from './index'

export default async () => {
  if ('serviceWorker' in navigator) {
    // Compute root URL by removing filename from path, if present
    const rootUrl =
      window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf('/') + 1,
      ) + 'api/'

    // Register service worker
    const registrations = await navigator.serviceWorker.getRegistrations()

    // Remove legacy workers during architectural transition
    await Promise.all(registrations.map(r => r.unregister()))

    // Setup new worker
    await navigator.serviceWorker.register('/api/worker.js', {
      scope: rootUrl,
    })
    console.log(`Preview worker registered successfully at ${rootUrl}`)

    // Prepopulate cache with library files
    await prePopulateCache()
  } else {
    throw new Error('Service workers not available')
  }
}
