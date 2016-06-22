// JQuery emulation
export const domSelect = function(selector, parent=document) {
  // If the selection occurs by id,
  // use getElementById, or querySelectorAll otherwise
  const selectorType = selector.indexOf('#') === 0 ?
    'getElementById' : 'querySelectorAll'

  // If we are using getElementById, remove
  // the leading '#' from the selector
  if (selectorType === 'getElementById') {
    selector = selector.substr(1, selector.length)
  }

  // Apply the appropriate selector to the
  // parent element
  return parent[selectorType](selector)
}

// Preload images
export const preload_image = function(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    // Resolve or reject the promise, depending
    // on whether the image loads successfully or not
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)

    // Set the image path, which puts it in the
    // queue for loading.
    image.src = url
  })
}

// Preload audio
export const preload_audio = function(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio()

    // Resolve/reject the promise based on the
    // preload results
    audio.addEventListener('canplaythrough', resolve)
    audio.addEventListener('error', reject)

    // Require the browser to preload the file,
    // even if it is not played directly
    audio.preload = 'auto'

    // Set the path
    audio.src = url
  })
}
