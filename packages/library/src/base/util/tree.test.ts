import { Component } from '../../core'
import { Frame } from '../../html'
import { Sequence } from '../../flow'

import { traverse, reduce } from './tree'

let s: Sequence, //
  a: Component,
  b: Component,
  c: Frame,
  d: Component

beforeEach(() => {
  a = new Component()
  b = new Component()
  d = new Component()
  c = new Frame({
    context: '<main></main>',
    contextSelector: 'main',
    content: d,
  })

  s = new Sequence({
    content: [a, b, c],
  })
})

it('traverses nested structure of components', () => {
  const spy = jest.fn()
  traverse(s, spy)

  expect(spy).toHaveBeenCalledTimes(5)
  expect(spy).toHaveBeenNthCalledWith(1, s)
  expect(spy).toHaveBeenNthCalledWith(2, a)
  expect(spy).toHaveBeenNthCalledWith(3, b)
  expect(spy).toHaveBeenNthCalledWith(4, c)
  expect(spy).toHaveBeenNthCalledWith(5, d)
})

it('reduces a tree to a specific value', () => {
  //@ts-expect-error - arbitrary property
  s.options.multiplier = 3
  //@ts-expect-error - arbitrary property
  a.options.multiplier = 4
  //@ts-expect-error - arbitrary property
  b.options.multiplier = 5
  //@ts-expect-error - arbitrary property
  c.options.multiplier = 6
  //@ts-expect-error - arbitrary property
  d.options.multiplier = 7

  const spy = jest.fn((acc, c) => acc * c.options.multiplier)

  expect(reduce(s, spy, 1)).toBe(2520)
})
