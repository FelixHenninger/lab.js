import { Component } from '../component'

export const aggregateParentOption = (leaf: Component, option: string) =>
  Object.assign(
    {},
    ...leaf.parents.map(o => o.options[option] || {}),
    leaf.options[option],
  )
