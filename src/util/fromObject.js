// Retrieve an entry from a nested object
// hierarchy, given a path
const retrieveNested = (path, object) => {
  let current = object
  for (let level of path) {
    current = current[level]
  }
  return current
}

// Construct a component given only an
// object that specifies the options
// (as would be passed to a regular object)
// and a type field that specifies the
// component type (e.g. 'lab.html.Screen')
const fromObject = (options) => {
  const typePath = options.type.split('.').slice(1)
  const constructor = retrieveNested(typePath, lab)

  // Parse any nested components
  constructor.metadata.nestedComponents.forEach(o => {
    if (Array.isArray(options[o])) {
      options[o] = options[o].map(fromObject)
    } else {
      options[o] = fromObject(options[o])
    }
  })

  return new constructor(options)
}

export default fromObject
