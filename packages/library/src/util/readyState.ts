export const awaitReadyState = (target = 'complete') =>
  // Wait for the document to be completely loaded
  new Promise<void>(resolve => {
    if (document.readyState === target) {
      resolve()
    } else {
      const changeHandler = (e: Event) => {
        if ((e as ProgressEvent<Document>).target?.readyState === target) {
          ;(e as ProgressEvent<Document>).target?.removeEventListener(
            'readystatechange',
            changeHandler,
          )
          resolve()
        }
      }
      document.addEventListener('readystatechange', changeHandler)
    }
  })
