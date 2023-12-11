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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(() => wrappedFetch(++attempt), d)
    }

    return wrappedFetch(0)
  })

// TODO: Making a generic variant of this function
// is left as an exercise to the reader (PRs very much appreciated)
