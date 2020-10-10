// Fetch wrapper with retrying and exponential backoff
// (this is loosely based on https://github.com/jonbern/fetch-retry,
// very much simplified and minus the isomorphic-fetch dependency)

type fetchOptions = RequestInit & {
  retry?: {
    times?: number
    delay?: number
    factor?: number
  }
}

export const fetch = (
  url: RequestInfo,
  {
    retry: { times = 3, delay = 10, factor = 5 } = {},
    ...options
  }: fetchOptions = {},
): Promise<Response> =>
  new Promise((resolve, reject) => {
    const wrappedFetch = (attempt: number) =>
      window
        .fetch(url, options)
        .then(response => resolve(response))
        .catch(error => {
          if (attempt <= times) {
            retry(attempt)
          } else {
            reject(error)
          }
        })

    const retry = (attempt: number) => {
      const d = delay * factor ** attempt
      setTimeout(() => wrappedFetch(++attempt), d)
    }

    return wrappedFetch(0)
  })

// TODO: Making a generic variant of this function
// is left as an exercise to the reader (PRs very much appreciated)

// Debouncing/throttling for async functions -----------------------------------
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
