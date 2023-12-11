class AsyncCache {
  // Generic cache class that wraps an async function,
  // and knows to return promises for pending results.
  // (the end result is very similar to memoization)
  cache = new Map()
  pending = new Map()
  cachedFunc: (...args: any[]) => any

  constructor(cachedFunc: (...args: any[]) => any) {
    // Async function that populates the cache given a single atomic key
    this.cachedFunc = cachedFunc
  }

  async get(key: any) {
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

  async getAll(keys: any[]) {
    return Promise.all(keys.map(k => this.get(k)))
  }

  readSync(key: any) {
    // Synchronous read access to the cache as a fallback;
    // external logic needs to ensure that entries are available
    if (this.cache.has(key)) {
      return this.cache.get(key)
    } else {
      throw Error(`Key "${key}" not present in cache`)
    }
  }
}

// Cache implementations for specific media types ------------------------------

const preloadImage = async (url: string) => {
  // Create an empty image element
  const image = new Image()
  image.src = url

  // Make sure to decode its contents
  await image.decode()

  return image
}

export class ImageCache extends AsyncCache {
  bitmapCache: WeakMap<HTMLImageElement, ImageBitmap>

  constructor() {
    super(preloadImage)
    this.bitmapCache = new WeakMap()
  }

  async get(key: string) {
    const image = await super.get(key)

    //@ts-expect-error - (I wish this function was always defined)
    if (window.createImageBitmap) {
      try {
        const bitmap = await createImageBitmap(image)
        this.bitmapCache.set(image, bitmap)
      } catch (e) {
        console.log(
          `Couldn't cache bitmap for ${key}, error ${JSON.stringify(e)}`,
        )
      }
    }

    return image
  }

  readSync(key: string) {
    const image = super.readSync(key)
    const bitmap = this.bitmapCache.get(image)

    return [image, bitmap]
  }
}

import { load as loadAudioBuffer } from '../timeline/items/audio'

export class AudioCache extends AsyncCache {
  constructor(audioContext: AudioContext) {
    super((url: string) => loadAudioBuffer(url, audioContext))
  }
}
