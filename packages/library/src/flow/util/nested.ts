import { Component } from '../../core/component'

// Helper function to handle nested components
export const prepareNested = function (nested: Component[], parent: Component) {
  // Setup parent links on nested components
  nested.forEach(c => {
    c.parent = parent
    c.internals.controller = parent.internals.controller
  })

  // Set ids on nested components
  nested.forEach((c, i) => {
    if (c.id === undefined) {
      // For each child, use this component's id
      // and append a counter
      if (parent.id == null) {
        c.id = String(i)
      } else {
        c.id = [parent.id, i].join('_')
      }
    }
  })

  // Trigger prepare on all nested components
  return Promise.all(
    nested.map(c => c.prepare(false)), // indicate automated call
  )
}
