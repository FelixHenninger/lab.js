import { omit } from 'lodash'
import upgrade from './upgrade'

export const fromObject = o =>
  omit(
    upgrade(o),
    ['version']
  )

export const fromJSON = input =>
  fromObject(
    JSON.parse(input)
  )
