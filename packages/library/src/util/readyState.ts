export const awaitReadyState = (target='complete') =>
  // Wait for the document to be completely loaded
  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  new Promise((resolve: any) => {
    if (document.readyState === target) {
      resolve()
    } else {
      const changeHandler = (e: any) => {
        if (e.target.readyState === target) {
          e.target.removeEventListener('readystatechange', changeHandler)
          resolve()
        }
      }
      document.addEventListener('readystatechange', changeHandler)
    }
  })
