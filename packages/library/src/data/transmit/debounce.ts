// Debouncing/throttling for async functions
// (this is an heavily modified version of the excellent
// https://github.com/sindresorhus/p-debounce that supports
// the cancel and flush helpers that lodash's debounce offers.
// Mistakes, of course, are entirely the present author's fault)

export const debounceAsync = (
  fn: Function,
  wait: number,
  { throttle = true } = {},
) => {
  let timer: number | null
  let resolvers: [Function, Function][] = []
  let lastArgs: IArguments | undefined, lastThis: any
  let running = false
  let skipped = false

  const invoke = function () {
    // Reset timer
    timer = null

    if (running && throttle) {
      skipped = true
    } else {
      // Keep hold currently pending resolvers, and reset list
      const pendingResolvers = resolvers
      resolvers = []

      // Execute function, capture and pass on result (or error)
      running = true
      Promise.resolve(fn.apply(lastThis, lastArgs))
        .then(result => {
          for (const [resolve, _] of pendingResolvers) {
            resolve(result)
          }
        })
        .catch(error => {
          for (const [_, reject] of pendingResolvers) {
            reject(error)
          }
        })
        .finally(() => {
          const wasSkipped = skipped
          running = skipped = false
          if (wasSkipped && timer === null) {
            flush()
          }
        })
    }
  }

  const flush = function () {
    timer && clearTimeout(timer)
    if (resolvers.length > 0) {
      // Create promise that resolves with final flush call
      const p = new Promise<any>((resolve, reject) => {
        resolvers.push([resolve, reject])
      })
      // Invoke the function once more
      invoke()
      // Return promise
      return p
    } else {
      return Promise.resolve()
    }
  }

  const cancel = function () {
    timer && clearTimeout(timer)
    timer = null
    skipped = false
    lastArgs = lastThis = undefined
    resolvers = []
  }

  const debouncedFunc = function (this: any) {
    return new Promise((resolve, reject) => {
      // Save arguments and context
      lastArgs = arguments
      lastThis = this

      // Stop the current and setup a new timer
      timer && clearTimeout(timer)
      timer = setTimeout(invoke, wait) as unknown as number

      // Save resolvers for future use
      resolvers.push([resolve, reject])
    })
  }
  // Add further methods
  debouncedFunc.flush = flush
  debouncedFunc.cancel = cancel

  return debouncedFunc
}
