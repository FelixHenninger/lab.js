import { omit } from 'lodash'
import upgrade from './upgrade'

export const fromJSON = (input) => {
  return omit(
    upgrade(JSON.parse(input)),
    ['version']
  )
}
