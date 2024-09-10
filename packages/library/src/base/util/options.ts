import { Parser, defaultParser, parsableOptions } from './parse'

import { Component } from '../component'

// Option proxy ----------------------------------------------------------------

export const makeOptionProxy = function (
  context: Component,
  rawOptions: any = {},
) {
  const parsedOptions = Object.create(rawOptions)

  let armed = false
  let parser: Parser | undefined = undefined
  const arm = function (newParser: Parser, newState: boolean = true) {
    if (newState === true) {
      parser = newParser
      const templateContext = {
        parameters: context.parameters,
        state: (context as any).state,
        files: context.files,
        random: (context as any).random,
      }
      Object.assign(
        parsedOptions,
        parser.parseAll(
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
        const candidate = parser!.parseOne(
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
