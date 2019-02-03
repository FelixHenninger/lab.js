// Regex for detecting awaits in a code snippet
export const awaitRegex = /(^|[^\w])await\s+/m

// Async function constructor
// The eval call here is needed to circumvent CRA's polyfills,
// and probably can be removed at some later point
// eslint-disable-next-line no-new-func
export const AsyncFunction = new Function(
  'return Object.getPrototypeOf(async function(){}).constructor'
)()

export const adaptiveFunction = code =>
  // Build an async function if await appears in the source
  // NOTE: This is a relatively coarse and naive check.
  // It works for us™ because we don't need to be careful
  // about accidentally declaring a function async:
  // In the situations where we apply them, the return values
  // are not important, just that the function returns at all.
  // Alternatively, we could check whether parsing the function
  // works, and listen for syntax errors. I'm lazy. -F
  code.match(awaitRegex)
    ? new AsyncFunction(code)
    // eslint-disable-next-line no-new-func
    : new Function(code)
