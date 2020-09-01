// Fetch wrapper with retrying and exponential backoff
// (this is loosely based on https://github.com/jonbern/fetch-retry,
// very much simplified and minus the isomorphic-fetch dependency)

export const fetch = (url: any,
  { retry:{ times=3, delay=10, factor=5 }={}, ...options }={}
) =>
  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  new Promise((resolve: any, reject: any) => {
    const wrappedFetch = (attempt: any) => window.fetch(url, options)
      .then(response => resolve(response))
      .catch(error => {
        if (attempt <= times) {
          retry(attempt)
        } else {
          reject(error)
        }
      })

    const retry = (attempt: any) => {
      const d = delay * factor ** attempt
      setTimeout(() => wrappedFetch(++attempt), d)
    }

    wrappedFetch(0)
  })

// TODO: Making a generic variant of this function
// is left as an exercise to the reader (PRs very much appreciated)

// Debouncing/throttling for async functions -----------------------------------
// (this is an heavily modified version of the excellent
// https://github.com/sindresorhus/p-debounce that supports
// the cancel and flush helpers that lodash's debounce offers.
// Mistakes, of course, are entirely the present author's fault)

export const debounceAsync = (fn: any, wait: any, { throttle=true }={}) => {
  let timer: any
  let resolvers: any = []
  let lastArgs: any, lastThis: any
  let running = false
  let skipped = false

  const invoke = function() {
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
      // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
      Promise.resolve(fn.apply(lastThis, lastArgs))
        .then((result: any) => {
          for (const [resolve, _] of pendingResolvers) {
            resolve(result)
          }
        }).catch((error: any) => {
          for (const [_, reject] of pendingResolvers) {
            reject(error)
          }
        }).finally(() => {
          if (skipped && timer === null) {
            flush()
          }
          running = skipped = false
        })
    }
  }

  const flush = function() {
    clearTimeout(timer)
    if (resolvers.length > 0) {
      invoke()
    }
  }

  const cancel = function() {
    clearTimeout(timer)
    timer = null
    skipped = false
    lastArgs = lastThis = undefined
    resolvers = []
  }

  const debouncedFunc = function() {
    // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
    return new Promise((resolve: any, reject: any) => {
      // Save arguments and context
      // @ts-expect-error ts-migrate(2496) FIXME: The 'arguments' object cannot be referenced in an ... Remove this comment to see the full error message
      lastArgs = arguments
      // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      lastThis = this

      // Stop the current and setup a new timer
      clearTimeout(timer)
      timer = setTimeout(invoke, wait)

      // Save resolvers for future use
      resolvers.push([resolve, reject])
    });
  }
  // Add further methods
  debouncedFunc.flush = flush
  debouncedFunc.cancel = cancel

  return debouncedFunc
}
