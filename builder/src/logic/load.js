import { omit } from 'lodash'

export const fromJSON = (input) => {
  return omit(JSON.parse(input), ['version'])
}
