import upgrade from './upgrade'

export const fromObject = o =>
  upgrade(o)

export const fromJSON = input =>
  fromObject(
    JSON.parse(input)
  )
