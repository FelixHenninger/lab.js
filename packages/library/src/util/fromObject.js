import { isObject, cloneDeep } from 'lodash'

// Retrieve an entry from a nested object
// hierarchy, given a path
const retrieveNested = (path, object) =>
  path.reduce(
    (subobject, subpath) => subobject[subpath],
    object,
  )

// Copy the options object before passing it into the
// (recursive) function that does the actual work
const fromObject = (options, libraryRoot) =>
  _fromObject(cloneDeep(options), libraryRoot)

// Construct a component given only an
// object that specifies the options
// (as would be passed to a regular object)
// and a type field that specifies the
// component type (e.g. 'lab.html.Screen')
const _fromObject = (options, libraryRoot) => {
  // If not explicitly specified, we assume that
  // the library is available as a global variable.
  const library = libraryRoot || window.lab

  if (library === undefined) {
    throw new Error(
      `Couldn't find library in global scope, and no root object available`
    )
  }

  const [, ...componentPath] = options.type.split('.')
  const constructor = retrieveNested(componentPath, library)

  // Parse any nested components
  constructor.metadata.nestedComponents.forEach((o) => {
    // ... if the associated option exists ...
    if (options[o]) {
      if (Array.isArray(options[o])) {
        // ... and it is an array ...
        options[o] = options[o].map(nested => fromObject(nested, library))
      } else if (isObject(options[o])) {
        // ... or an object ...
        options[o] = fromObject(options[o], library)
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
      try {
        // Load the plugin from either the path or the type
        // option (TODO: Consider deprecating one of these)
        const [scope, ...pluginPath] =
          (pluginOptions.path || pluginOptions.type).split('.')
        const PluginConstructor = retrieveNested(
          pluginPath,
          // Load plugins from the global scope if requested
          scope === 'global' ? (global || window) : library,
        )
        return new PluginConstructor(pluginOptions)
      } catch (e) {
        throw new Error(
          `Couldn't instantiate plugin ${ pluginOptions.type }. ` +
          `Error: ${ e.message }`
        )
      }
    })
  }

  // Create a new component from the preprocessed options
  return new constructor(options)
}

export default fromObject
