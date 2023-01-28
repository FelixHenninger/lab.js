import { omitBy } from 'lodash'
import { Table } from '../store'

export const cleanData = <R>(data: Table<R>): Table<Partial<R>> =>
  // Filter keys that start with an underscore
  data.map(row =>
    omitBy(row as unknown as object, (_, k) => k.startsWith('_')),
  ) as Table<Partial<R>>
