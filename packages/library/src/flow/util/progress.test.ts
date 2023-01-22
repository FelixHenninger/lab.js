import { Component } from '../../core'
import { setupTestingContext } from '../../core/test/helpers'
import { Sequence } from '../sequence'

setupTestingContext()

it('Can calculate basic (unweighted) progress', async () => {
  const c1 = new Component()
  const c2 = new Component()
  const c3 = new Component()

  const s = new Sequence({
    content: [c1, c2, c3],
  })

  await s.run()

  expect(s.progress).toBe(0)
  await c1.end()
  expect(s.progress).toBe(1 / 3)
  await c2.end()
  expect(s.progress).toBe(2 / 3)
  await c3.end()
  expect(s.progress).toBe(1)
})

it('Can calculate weighted progress', async () => {
  const c1 = new Component({ progressWeight: 1 })
  const c2 = new Component({ progressWeight: 2 })
  const c3 = new Component({ progressWeight: 3 })

  const s = new Sequence({
    content: [c1, c2, c3],
  })

  await s.run()

  expect(s.progress).toBe(0)
  await c1.end()
  expect(s.progress).toBe(1 / 6)
  await c2.end()
  expect(s.progress).toBe(3 / 6)
  await c3.end()
  expect(s.progress).toBe(1)
})
