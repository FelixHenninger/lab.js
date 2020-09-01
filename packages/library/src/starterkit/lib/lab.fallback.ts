// Detect whether fallback version is needed
(function() {

  try {
    var fancyFunction = eval('async function* fancy() {}')
  } catch (e) {
    // Compute path to legacy library
    // (this could use document.currentScript, but sadly the
    // browsers that need this workaround don't support that)
    var scriptTag = document
      .querySelector('script[data-labjs-script="library"]')

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    var scriptPath = scriptTag.src
      .split('/').slice(0, -1).join('/') + '/lab.legacy.js'

    var script = document.createElement('script')
    script.src = scriptPath

    // Load legacy library version in old browsers
    // by inserting script tag after current library version
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    scriptTag.parentNode.insertBefore(script, scriptTag.nextSibling)
  }

})();
