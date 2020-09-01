class AsyncCache {
  // Generic cache class that wraps an async function,
  // and knows to return promises for pending results.
  // (the end result is very similar to memoization)
  cache = new Map()
  pending = new Map()

  constructor(cachedFunc) {
    // Async function that populates the cache given a single atomic key
    this.cachedFunc = cachedFunc
  }

  async get(key) {
    if (this.cache.has(key)) {
      // Read entry directly from cache if possible ...
      return this.cache.get(key)
    } else if (this.pending.has(key)) {
      // ... return pending promise if cache is being populated already ...
      return await this.pending.get(key)
    } else {
      // ... or populate cache by calling supplied function.
      const promise = this.cachedFunc(key)
      this.pending.set(key, promise)

      // When the result is in, replace pending data
      const result = await promise
      this.cache.set(key, result)
      this.pending.delete(key)

      return result
    }
  }

  async getAll(keys) {
    return Promise.all(keys.map(k => this.get(k)))
  }

  readSync(key) {
    // Synchronous read access to the cache as a fallback;
    // external logic needs to ensure that entries are available
    if (this.cache.has(key)) {
      return this.cache.get(key)
    } else {
      throw Error(`Key ${ key } not present in cache`)
    }
  }
}

// Cache implementations for specific media types ------------------------------

const preloadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()

    // Resolve or reject the promise, depending
    // on whether the image loads successfully or not
    image.addEventListener('load',  () => resolve(image))
    image.addEventListener('error', (e) => reject(e))

    // Set the image path, which puts it in the
    // queue for loading.
    image.src = url
  })

export class ImageCache extends AsyncCache {
  constructor() {
    super(preloadImage)
  }
}

import { load as loadAudioBuffer } from './timeline/items/audio'

export class AudioCache extends AsyncCache {
  constructor(audioContext) {
    super((url) => loadAudioBuffer(url, audioContext))
  }
}
