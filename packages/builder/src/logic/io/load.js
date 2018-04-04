import upgrade from './upgrade'

export const fromObject = o =>
  upgrade({
    // Inject an early fallback version,
    // in case the data doesn't include one
    // already.
    // TODO: Remove this after versioning
    // has been firmly established.
    version: [2017, 1, 7],
    ...o,
  })

export const fromJSON = input =>
  fromObject(
    JSON.parse(input)
  )
