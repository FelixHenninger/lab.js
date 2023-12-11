import { isObject, cloneDeep } from 'lodash'

export type SerializedComponent = {
  type: string
  plugins: SerializedPlugin[]
  [option: string]: any
}

export type SerializedPlugin = {
  type: string
  path: string // TODO: Deprecate this!
  [option: string]: any
}

// Retrieve an entry from a nested object
// hierarchy, given a path
const retrieveNested = (path: string[], object: Record<string, any>) =>
  path.reduce(
    (subobject: { [key: string]: any }, subpath: string) => subobject[subpath],
    object,
  )

// Copy the options object before passing it into the
// (recursive) function that does the actual work
const fromObject = (
  options: SerializedComponent,
  libraryRoot: Record<string, any>,
) => _fromObject(cloneDeep(options), libraryRoot)

// Construct a component given only an
// object that specifies the options
// (as would be passed to a regular object)
// and a type field that specifies the
// component type (e.g. 'lab.html.Screen')
const _fromObject = (options: SerializedComponent, libraryRoot: Record<string, any>) => {
  // If not explicitly specified, we assume that
  // the library is available as a global variable.
  //@ts-expect-error - (we check for the presence of the library below)
  const library = libraryRoot ?? window.lab

  if (library === undefined) {
    throw new Error(
      `Couldn't find library in global scope, and no root object available`,
    )
  }

  const [, ...componentPath] = options.type.split('.')
  // TODO: Make component type
  const constructor = retrieveNested(componentPath, library) as any

  // Parse any nested components
  constructor.metadata.nestedComponents.forEach((o: string) => {
    // ... if the associated option exists ...
    if (options[o]) {
      if (Array.isArray(options[o])) {
        // ... and it is an array ...
        options[o] = options[o].map((nested: any) =>
          fromObject(nested, library),
        )
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
    options.plugins = options.plugins.map(pluginOptions => {
      try {
        // Load the plugin from either the path or the type
        // option (TODO: Consider deprecating one of these)
        const [scope, ...pluginPath] = (
          pluginOptions.path ?? pluginOptions.type
        ).split('.')
        const PluginConstructor = retrieveNested(
          pluginPath,
          // Load plugins from the global scope if requested
          scope === 'global' ? global ?? window : library,
        ) as any // TODO: Make plugin type
        return new PluginConstructor(pluginOptions)
      } catch (e) {
        throw new Error(
          `Couldn't instantiate plugin ${pluginOptions.type}. ` +
            `Error: ${(e as Error).message ?? 'Undefined error'}`,
        )
      }
    })
  }

  // Create a new component from the preprocessed options
  return new constructor(options)
}

export default fromObject
