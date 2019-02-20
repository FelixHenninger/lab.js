import { load as loadAudioBuffer } from './timeline/items/audio'

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
export const preloadAudio = async (url, cache, audioContext) => {
  if (cache && !(url in cache)) {
    cache[url] = await loadAudioBuffer(audioContext, url)
  }
}
