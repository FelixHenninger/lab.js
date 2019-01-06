import { isObject } from 'lodash'

// Retrieve an entry from a nested object
// hierarchy, given a path
const retrieveNested = (path, object) =>
  path.reduce(
    (subobject, subpath) => subobject[subpath],
    object,
  )

// Construct a component given only an
// object that specifies the options
// (as would be passed to a regular object)
// and a type field that specifies the
// component type (e.g. 'lab.html.Screen')
const fromObject = (options) => {
  // We assume that the library
  // is available as a global variable
  /* global lab:false */
  const [, ...componentPath] = options.type.split('.')
  const constructor = retrieveNested(componentPath, lab)

  // Parse any nested components
  constructor.metadata.nestedComponents.forEach((o) => {
    // ... if the associated option exists ...
    if (options[o]) {
      if (Array.isArray(options[o])) {
        // ... and it is an array ...
        options[o] = options[o].map(fromObject)
      } else if (isObject(options[o])) {
        // ... or an object ...
        options[o] = fromObject(options[o])
      }
      // ... otherwise ignore it.
      // (another option would be to delete
      // the option, but I think that would
      // lead to weird errors -- the goal
      // here is to avoid errors in conversion)
    }
  })

  // Parse plugins separately
  // (this might also someday be replaced
  // by a more general mechanism, but for now
  // there is no need for e.g. nested hierarchies)
  if (options.plugins) {
    options.plugins = options.plugins.map((pluginOptions) => {
      const [scope, ...pluginPath] = pluginOptions.type.split('.')
      const PluginConstructor = retrieveNested(
        pluginPath,
        // Load plugins from the global scope if requested
        scope === 'global' ? (global || window) : lab
      )
      return new PluginConstructor(pluginOptions)
    })
  }

  // Create a new component from the preprocessed options
  return new constructor(options)
}

export default fromObject
