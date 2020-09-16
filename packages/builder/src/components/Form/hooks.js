import { useEffect, useRef } from 'react'

// These hook variations are loosely adapted from react-use
// (https://github.com/streamich/react-use), a public-domain library

const useUpdates = (effect, deps) => {
  // Discard the initial call to an effect, but fire on subsequent ones
  const initial = useRef(true)

  useEffect(
    initial.current
      ? () => { initial.current = false }
      : effect,
    deps
  )
}

export const useDebounce = (fn, wait, args, filter=true) => {
  // Debounce an effect for a given interval
  useUpdates(() => {
    // TODO: HERE BE DRAGONS!
    // It's not 100% clear whether the filter criterion works the way
    // it's intended here. It looks alright, but the code was written
    // without super-in depth knowledge of hooks. This kinda matches the
    // hooks rules (https://reactjs.org/docs/hooks-rules.html), but
    // clearly it also deserves closer inspection.
    let timeout = undefined
    if (filter) {
      timeout = setTimeout(() => fn(...args), wait)
      // NOTE: the spread is a custom addition, and possibly a stupid one
    }

    // Reset timeout if the arguments change
    return () => clearTimeout(timeout)
  }, args)
}
