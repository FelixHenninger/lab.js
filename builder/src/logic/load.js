import { omit } from 'lodash'
import upgrade from './upgradeFile.js'

export const fromJSON = (input) => {
  return omit(
    upgrade(JSON.parse(input)),
    ['version']
  )
}
