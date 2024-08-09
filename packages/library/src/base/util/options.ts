import { parse as parseDefault, parseAll as parseAllDefault, parsableOptions } from './parse'

import { Component } from '../component'

// Option proxy ----------------------------------------------------------------

export const makeOptionProxy = function (
  context: Component,
  rawOptions: any = {},
  parse: (
    options: Object,
    context: Object,
    metadata: Map<string, any>,
    that: any,
  ) => any = parseDefault,
  parseAll: (
    options: Object,
    context: Object,
    metadata: Map<string, any>,
    that: any,
  ) => any = parseAllDefault,
) {
  const parsedOptions = Object.create(rawOptions)

  let armed = false
  const arm = function (newState: boolean = true) {
    if (newState === true) {
      const templateContext = {
        parameters: context.parameters,
        state: (context as any).state,
        files: context.files,
        random: (context as any).random,
      }
      Object.assign(
        parsedOptions,
        parseAll(
          rawOptions,
          templateContext,
          parsableOptions(context),
          templateContext,
        ),
      )
    }
    armed = newState
  }

  const proxy = new Proxy(rawOptions, {
    get: (obj, prop) => Reflect.get(parsedOptions, prop),
    set: (obj, key, value) => {
      // Set raw option
      Reflect.set(obj, key, value)

      if (armed) {
        // Set parsed option
        const candidate = parse(
          value,
          {
            parameters: context.parameters,
            state: (context as any).state,
            files: context.files,
            random: (context as any).random,
          },
          parsableOptions(context)[key],
          context,
        )

        if (candidate !== value) {
          Reflect.set(parsedOptions, key, candidate)
        }
      }

      // Acknowledge success
      return true
    },
  })

  return [proxy, arm]
}
