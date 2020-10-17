import { omitBy } from 'lodash'
import { Table } from '../store'

export const cleanData = (data: Table) =>
  // Filter keys that start with an underscore
  data.map(row => omitBy(row, (_, k) => k.startsWith('_')))
