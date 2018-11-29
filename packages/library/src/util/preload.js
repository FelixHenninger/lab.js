// Preload images
export const preloadImage = (url, cache) =>
  new Promise((resolve, reject) => {
    const image = new Image()

    // Resolve or reject the promise, depending
    // on whether the image loads successfully or not
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)

    // Set the image path, which puts it in the
    // queue for loading.
    image.src = url

    // Add image to cache, if present
    if (cache) {
      cache[url] = image
    }
  })

// Preload audio
export const preloadAudio = (url, cache) =>
  new Promise((resolve, reject) => {
    const audio = new Audio()

    // Resolve/reject the promise based on the
    // preload results
    audio.addEventListener('canplaythrough', resolve)
    audio.addEventListener('error', reject)

    // Require the browser to preload the file,
    // even if it is not played directly
    audio.preload = 'auto'

    // Set the path
    audio.src = url

    // Add audio to cache, if present
    if (cache) {
      cache[url] = audio
    }
  })
