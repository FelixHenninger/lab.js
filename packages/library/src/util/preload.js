// Preload images
export const preloadImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image()

    // Resolve or reject the promise, depending
    // on whether the image loads successfully or not
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)

    // Set the image path, which puts it in the
    // queue for loading.
    image.src = url
  })

// Preload audio
export const preloadAudio = url =>
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
  })
