// Given an array of functions that return promises,
// execute them in sequence with specified arguments
export const promise_chain = function(tasks) {
  return tasks.reduce((chain, f) => {
    return chain.then(f)
  }, Promise.resolve())
}
