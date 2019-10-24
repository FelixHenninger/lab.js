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
