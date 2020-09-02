import { load as loadAudioBuffer } from './timeline/items/audio'

class AsyncCache {
  cachedFunc: any

  // Generic cache class that wraps an async function,
  // and knows to return promises for pending results.
  // (the end result is very similar to memoization)
  // @ts-expect-error ts-migrate(2583) FIXME: Cannot find name 'Map'. Do you need to change your... Remove this comment to see the full error message
  cache = new Map()

  // @ts-expect-error ts-migrate(2583) FIXME: Cannot find name 'Map'. Do you need to change your... Remove this comment to see the full error message
  pending = new Map()

  constructor(cachedFunc: any) {
    // Async function that populates the cache given a single atomic key
    this.cachedFunc = cachedFunc
  }

  async get(key: any) {
    if (this.cache.has(key)) {
      // Read entry directly from cache if possible ...
      return this.cache.get(key)
    }
    if (this.pending.has(key)) {
      // ... return pending promise if cache is being populated already ...
      return await this.pending.get(key)
    }
    // ... or populate cache by calling supplied function.
    const promise = this.cachedFunc(key)
    this.pending.set(key, promise)

    // When the result is in, replace pending data
    const result = await promise
    this.cache.set(key, result)
    this.pending.delete(key)

    return result
  }

  async getAll(keys: any) {
    return Promise.all(keys.map((k: any) => this.get(k)))
  }

  readSync(key: any) {
    // Synchronous read access to the cache as a fallback;
    // external logic needs to ensure that entries are available
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    throw Error(`Key ${key} not present in cache`)
  }
}

// Cache implementations for specific media types ------------------------------

const preloadImage = (url: any) =>
  new Promise((resolve: any, reject: any) => {
    const image = new Image()

    // Resolve or reject the promise, depending
    // on whether the image loads successfully or not
    image.addEventListener('load', () => resolve(image))
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

export class AudioCache extends AsyncCache {
  constructor(audioContext: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    super((url: any) => loadAudioBuffer(url, audioContext))
  }
}
