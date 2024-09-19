import { isString, isArray, isPlainObject, template } from 'lodash'

import { Component } from '../component'

// Metadata management ---------------------------------------------------------

const prototypeChain = (object: object) => {
  // Compute the prototype chain a given object
  const chain = [Object.getPrototypeOf(object)]

  while (Object.getPrototypeOf(chain[0])) {
    chain.unshift(Object.getPrototypeOf(chain[0]))
  }

  return chain
}

export const parsableOptions = (component: Component) =>
  // Collect parsable options from the static property metadata
  // of all components on the prototype chain
  Object.assign(
    {},
    ...prototypeChain(component).map(
      p => p.constructor.metadata?.parsableOptions,
    ),
  )

// Option parsing --------------------------------------------------------------

const parseOne = (
  raw: any,
  context: any,
  metadata: { [option: string]: any },
  that: any = {},
): any => {
  // Don't parse anything without metadata
  if (!metadata) {
    return raw
  }

  if (isString(raw)) {
    // Parse output
    const output = template(raw, {
      escape: '' as unknown as RegExp, // TODO 😬
      evaluate: '' as unknown as RegExp,
    }).call(that, context)

    // Cooerce type if requested
    switch (metadata.type) {
      case undefined:
        return output
      case 'number':
        return Number(output)
      case 'boolean':
        return Boolean(output.trim() !== 'false')
      default:
        throw new Error(
          `Output type ${metadata.type} unknown, can't convert option`,
        )
    }
  } else if (isArray(raw)) {
    // Recursively parse array
    return raw.map(o => parseOne(o, context, metadata.content, that))
  } else if (isPlainObject(raw)) {
    // Parse individual key/value pairs
    // and construct a new object from results
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [
        // Parse keys only if the appropriate flag is set
        metadata.keys ? parseOne(k, context, {}, that) : k,
        // Parse values
        parseOne(
          v,
          context,
          // Try the key-specific metadata settings,
          // or, alternatively, use the catch-all
          metadata.content?.[k] || metadata.content?.['*'],
          that,
        ),
      ]),
    )
  } else {
    // If we don't know how to parse things,
    // leave them as they are.
    return raw
  }
}

const parseAll = (
  rawOptions: any,
  context: any,
  metadata: { [option: string]: any },
  that: any,
): any =>
  // Given a set of unparsed options and metadata,
  // parse only the subset of options that are defined,
  // and for which metadata is available. The output
  // will only included those options for which parsing
  // has resulted in different output
  Object.fromEntries(
    Object.entries(metadata)
      .map(([k, v]) => {
        if (rawOptions[k]) {
          const candidate = parseOne(rawOptions[k], context, v, that)

          if (candidate !== rawOptions[k]) {
            return [k, candidate]
          }
        }

        return undefined
      })
      .filter(e => e !== undefined) as [string, any][],
  )

export type Parser = {
  parseOne: (
    rawOption: any,
    context: Object,
    metadata: Map<string | symbol, any>,
    that: any,
  ) => any
  parseAll: (
    options: Object,
    context: Object,
    metadata: Map<string | symbol, any>,
    that: any,
  ) => any
  parsableOptions: (component: Component) => Map<string | symbol, any>
}

export const defaultParser: Parser = {
  parseOne,
  parseAll,
  parsableOptions,
}
