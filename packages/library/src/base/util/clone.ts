import { cloneDeepWith } from 'lodash'
import { Component } from '../component'

export const clone = <T extends Component>(
  component: T,
  options: Partial<T['options']> = {},
): T => {
  // Return a component of the same type, with identical options
  // We copy all options from the current component,
  // except for those that may contain components
  // themselves -- in that case, we recursively
  // create cloned copies of the original component.
  const nestedComponents =
    (component.constructor as typeof Component).metadata.nestedComponents || []

  const cloneOptions = {
    ...cloneDeepWith(component.internals.rawOptions, (v, k, root) => {
      // Don't clone the datastore
      // TODO: This can be removed when the datastore is no longer
      // passed through options
      if (k === 'datastore') {
        return null
      }

      // For immediately nested options that contain components,
      // call their clone method instead of copying naively
      if (
        root === component.internals.rawOptions &&
        nestedComponents.includes(k)
      ) {
        // Choose procedure depending on data type
        if (Array.isArray(v)) {
          // Apply clone method to arrays of components
          return v.map(c => (c instanceof Component ? clone(c) : c))
        } else if (v instanceof Component) {
          // Only clone components, any other data type
          // will be left to the library clone function
          return clone(v)
        }
      }
    }),
    // Overwrite existing options, if so instructed
    ...options,
  }

  // Construct a new component of the same type
  //@ts-ignore
  return new component.constructor(cloneOptions)
}
