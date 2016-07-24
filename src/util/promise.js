// Given an array of functions that return promises,
// execute them in sequence with specified arguments
export const promiseChain = tasks =>
  tasks.reduce(
    (chain, f) => chain.then(f),
    Promise.resolve()
  )
