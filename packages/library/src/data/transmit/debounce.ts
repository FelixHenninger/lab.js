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
    if (running && throttle) {
      skipped = true
    } else {
      // Keep hold currently pending resolvers, and reset list
      const pendingResolvers = resolvers
      resolvers = []

      // Reset timer
      timer = null

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
          if (skipped && timer === null) {
            flush()
          }
          running = skipped = false
        })
    }
  }

  const flush = function () {
    timer && clearTimeout(timer)
    if (resolvers.length > 0) {
      invoke()
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
      timer = <any>setTimeout(invoke, wait)

      // Save resolvers for future use
      resolvers.push([resolve, reject])
    })
  }
  // Add further methods
  debouncedFunc.flush = flush
  debouncedFunc.cancel = cancel

  return debouncedFunc
}
