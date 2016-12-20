import { entries, extend, template } from 'lodash'

// TODO: Does this work in shorthand notation? () => {}
const parsableOptions = function parsableOptions() {
  // Compute the prototype chain for the current object
  const prototypeChain = [Object.getPrototypeOf(this)]

  while (Object.getPrototypeOf(prototypeChain[0])) {
    prototypeChain.unshift(
      Object.getPrototypeOf(prototypeChain[0]),
    )
  }

  // Collect parsable options from the static property metadata
  return extend(
    {},
    ...prototypeChain.map((p) => {
      return p.constructor.metadata
        ? p.constructor.metadata.parsableOptions
        : undefined
    }),
  )
}

export const parseOption = function parseOption(key, value, context, metadata=undefined) {
  // Only parse strings
  if (typeof value !== 'string') {
    return value
  } else {
    // Look up output options (specifically type),
    // if these are not passed as parameters
    const outputOptions = metadata || parsableOptions.call(this)[key]

    // If the current option is not among the parsed options,
    // don't touch the value
    if (!outputOptions) {
      return value
    }

    // Extract the desired type from the metadata argument,
    // or by checking the component metadata
    const [outputType] = outputOptions

    // Parse output
    // TODO: Decide whether it is a good idea to expose
    // the component here (via this). The alternative
    // would be to be to set this to the window object
    // TODO: Also decide whether to block escaping/evaluating
    // template code at this point
    const output = template(value, {
      'escape': '',
      'evaluate': '',
    }).call(this, context)

    // Cooerce type if necessary
    if (typeof output !== outputType) {
      switch (outputType) {
        case 'number':
          return Number(output)
        default:
          throw new Error(
            'Output type unknown, can\'t convert option',
          )
      }
    } else {
      // Only return new value if a parameter
      // was actually substituted
      return output !== value ? output : null
    }
  }
}

export const parseAllOptions = function(options, context) {
  const optionsMetadata = parsableOptions.call(this)
  const output = {}

  // Parse all of the options that are
  // marked as parsable, and save them to output
  // if the option has actually changed
  for (const [key, metadata] of entries(optionsMetadata)) {
    const candidate = parseOption.call(this, key, options[key], context, metadata)

    if (candidate) {
      output[key] = candidate
    }
  }

  return output
}
