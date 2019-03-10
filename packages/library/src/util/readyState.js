export const awaitReadyState = (target='complete') =>
  // Wait for the document to be completely loaded
  new Promise(resolve => {
    if (document.readyState === target) {
      resolve()
    } else {
      const changeHandler = e => {
        if (e.target.readyState === target) {
          e.target.removeEventListener('readystatechange', changeHandler)
          resolve()
        }
      }
      document.addEventListener('readystatechange', changeHandler)
    }
  })
