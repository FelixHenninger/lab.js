import { extend, isString, isArray, isPlainObject,
  template, fromPairs } from 'lodash'

const prototypeChain = (object) => {
  // Compute the prototype chain a given object
  const chain = [Object.getPrototypeOf(object)]

  while (Object.getPrototypeOf(chain[0])) {
    chain.unshift(
      Object.getPrototypeOf(chain[0]),
    )
  }

  return chain
}

export const parsableOptions = component =>
  // Collect parsable options from the static property metadata
  // of all components on the prototype chain
  extend({},
    ...prototypeChain(component).map(p => (
      p.constructor.metadata
        ? p.constructor.metadata.parsableOptions
        : undefined
    )),
  )

export const parse = (raw, context, metadata, that) => {
  // Don't parse anything without metadata
  if (!metadata) {
    return raw
  }

  if (isString(raw)) {
    // Parse output
    // TODO: Decide whether it is a good idea to expose
    // the component here (via this). The alternative
    // would be to be to set this to the window object
    const output = template(raw, {
      escape: '',
      evaluate: '',
    }).call(that, context)

    // Cooerce type if requested
    switch (metadata.type) {
      case undefined:
        return output
      case 'number':
        return Number(output)
      default:
        throw new Error(
          `Output type ${ metadata.type } unknown, can't convert option`,
        )
    }
  } else if (isArray(raw)) {
    // Recursively parse array
    return raw.map(
      o => parse(o, context, metadata.content),
    )
  } else if (isPlainObject(raw)) {
    // Parse individual key/value pairs
    // and construct a new object from results
    return fromPairs(
      Object.entries(raw).map(
        ([k, v]) => [k, parse(v, context, metadata.content[k])],
      ),
    )
  } else {
    // If we don't know how to parse things,
    // leave them as they are.
    return raw
  }
}

export const parseRequested = (rawOptions, context, metadata, that) =>
  // Given a set of unparsed options and metadata,
  // parse only the subset of options that are defined,
  // and for which metadata is available. The output
  // will only included those options for which parsing
  // has resulted in different output
  fromPairs(
    Object.entries(metadata)
      .map(([k, v]) => {
        if (rawOptions[k]) {
          const candidate = parse(rawOptions[k], context, v, that)

          if (candidate !== rawOptions[k]) {
            return [k, candidate]
          }
        }

        return undefined
      }).filter(e =>
        e !== undefined,
      ),
  )
