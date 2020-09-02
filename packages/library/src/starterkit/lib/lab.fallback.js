// Detect whether fallback version is needed
;(function () {
  try {
    const fancyFunction = eval('async function* fancy() {}')
  } catch (e) {
    // Compute path to legacy library
    // (this could use document.currentScript, but sadly the
    // browsers that need this workaround don't support that)
    const scriptTag = document.querySelector(
      'script[data-labjs-script="library"]',
    )

    const scriptPath = `${scriptTag.src
      .split('/')
      .slice(0, -1)
      .join('/')}/lab.legacy.js`

    const script = document.createElement('script')
    script.src = scriptPath

    // Load legacy library version in old browsers
    // by inserting script tag after current library version
    scriptTag.parentNode.insertBefore(script, scriptTag.nextSibling)
  }
})()
