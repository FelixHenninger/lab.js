import Raven from 'raven-js'

export default () => {
  if ('serviceWorker' in navigator) {
    // Compute root URL by removing filename from path, if present
    const rootUrl = window.location.pathname.substring(
      0, window.location.pathname.lastIndexOf('/') + 1
    )

    // Register service worker
    navigator.serviceWorker
      .register('worker.js', { scope: rootUrl })
      .then(() => console.log('Service worker registered successfully'))
      .catch(e => {
        console.log('Error during service worker registration:', e)
        Raven.captureException(e)
      })
  } else {
    // Alert the user to the fact that their browser
    // does not support service workers
    console.log('Service workers not available, preview will be disabled')
  }
}
