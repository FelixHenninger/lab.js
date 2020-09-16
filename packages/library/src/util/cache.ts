import { load as loadAudioBuffer } from './timeline/items/audio'

class AsyncCache {
  cachedFunc: any

  // Generic cache class that wraps an async function,
  // and knows to return promises for pending results.
  // (the end result is very similar to memoization)
  cache = new Map()

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
    } else {
      throw Error(`Key "${key}" not present in cache`)
    }
    throw Error(`Key ${key} not present in cache`)
  }
}

// Cache implementations for specific media types ------------------------------

const preloadImage = async (url) => {
  // Create an empty image element
  const image = new Image()
  image.src = url

  // Make sure to decode its contents
  await image.decode()

  return image
}

export class ImageCache extends AsyncCache {
  bitmapCache: WeakMap<Record<string, any>, ImageBitmap>

  constructor() {
    super(preloadImage)
    this.bitmapCache = new WeakMap()
  }

  async get(key) {
    const image = await super.get(key)

    if (window.createImageBitmap) {
      try {
        const bitmap = await createImageBitmap(image)
        this.bitmapCache.set(image, bitmap)
      } catch (e) {
        console.log(`Couldn't cache bitmap for ${key}, error ${e}`)
      }
    }

    return image
  }

  readSync(key) {
    const image = super.readSync(key)
    const bitmap = this.bitmapCache.get(image)

    return [image, bitmap]
  }
}

export class AudioCache extends AsyncCache {
  constructor(audioContext: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
    super((url: any) => loadAudioBuffer(url, audioContext))
  }
}
