// Fetch wrapper with retrying and exponential backoff
// (this is loosely based on https://github.com/jonbern/fetch-retry,
// very much simplified and minus the isomorphic-fetch dependency)

export const fetch = (url,
  { retry:{ times=3, delay=10, factor=5 }={}, ...options }={}
) =>
  new Promise((resolve, reject) => {
    const wrappedFetch = (attempt) =>
      window.fetch(url, options)
        .then(response => resolve(response))
        .catch(error => {
          if (attempt <= times) {
            retry(attempt)
          } else {
            reject(error)
          }
        })

    const retry = (attempt) => {
      const d = delay * factor ** attempt
      setTimeout(() => wrappedFetch(++attempt), d)
    }

    wrappedFetch(0)
  })

// TODO: Making a generic variant of this function
// is left as an exercise to the reader (PRs very much appreciated)

// Debouncing/throttling for async functions -----------------------------------
// (this is an extension of the excellent
// https://github.com/sindresorhus/p-debounce that supports
// the cancel and flush helpers that lodash's debounce offers.
// Mistakes, of course, are entirely the present author's fault)

export const debounceAsync = (fn, wait) => {
  let timer
  let resolvers = []
  let lastArgs, lastThis

  const invoke = function() {
    // Keep hold currently pending resolvers, and reset list
    const pendingResolvers = resolvers
    resolvers = []

    // Execute function and capture result
    const result = fn.apply(lastThis, lastArgs)

    // Pass result to pending resolvers
    for (const [res, _] of pendingResolvers) {
      res(result)
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
    lastArgs = lastThis = undefined
    resolvers = []
  }

  const debouncedFunc = function() {
    return new Promise((resolve, reject) => {
      // Save arguments and context
      lastArgs = arguments
      lastThis = this

      // Stop the current and setup a new timer
      clearTimeout(timer)
      timer = setTimeout(invoke, wait)

      // Save resolvers for future use
      resolvers.push([resolve, reject])
    })
  }
  // Add further methods
  debouncedFunc.flush = flush
  debouncedFunc.cancel = cancel

  return debouncedFunc
}
