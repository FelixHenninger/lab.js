import { isArray, cloneDeep } from 'lodash'
import { Component } from '../component'

export const traverse = (root: Component, callback: (c: Component) => void) => {
  callback(root)

  // Retrieve metadata from component
  const metadata = Object.getPrototypeOf(root).constructor.metadata

  if (metadata.nestedComponents) {
    // Retrieve nested components form associated options
    metadata.nestedComponents.forEach((o: string) => {
      const nested = root.options[o]

      if (isArray(nested)) {
        // Traverse array of nested components
        nested.map(c => traverse(c, callback))
      } else if (nested instanceof Component) {
        // Traverse components directly
        traverse(nested, callback)
      }
    })
  }
}

export const reduce = <T>(
  root: Component,
  callback: (currentValue: T, c: Component) => T,
  initialValue: T,
) => {
  let accumulator = cloneDeep(initialValue)

  // Traverse tree, while updating
  // the initial value throughout
  traverse(root, current => (accumulator = callback(accumulator, current)))

  return accumulator
}
