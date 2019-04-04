import { isArray, cloneDeep } from 'lodash'
import { Component } from '../core'

export const traverse = (root, callback) => {
  callback(root)

  // Retrieve metadata from component
  const metadata = Object.getPrototypeOf(root).constructor.metadata

  if (metadata.nestedComponents) {
    // Retrieve nested components form associated options
    metadata.nestedComponents.forEach((o) => {
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

export const reduce = (root, callback, initialValue) => {
  let accumulator = cloneDeep(initialValue)

  // Traverse tree, while updating
  // the initial value throughout
  traverse(
    root,
    current => (accumulator = callback(accumulator, current)),
  )

  return accumulator
}

export const aggregateParentOption = (leaf, option) =>
  Object.assign({},
    ...leaf.parents.map(o => o.options[option] || {}),
    leaf.options[option],
  )
