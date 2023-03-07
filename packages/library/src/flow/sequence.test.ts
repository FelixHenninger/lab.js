import { range } from 'lodash'

import { Component } from '../core'
import { Sequence } from './sequence'
import { Screen as HTMLScreen } from '../html'
import { Screen as CanvasScreen } from '../canvas'

import { setupTestingContext } from '../core/test/helpers'

setupTestingContext()

it('Can rerun content multiple times', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })

  const s = new Sequence({
    id: 's',
    content: [a, b, c],
  })

  await s.run()

  for (const i in range(10)) {
    // Run as ususal
    expect(s.internals.controller.currentLeaf).toEqual(b)
    await b.end()
    expect(s.internals.controller.currentLeaf).toEqual(c)

    // Now restart once
    await s.internals.controller.jump('rerun', { sender: s })
    expect(s.internals.controller.currentLeaf).toEqual(b)
  }
})

it('Supports rerunning top level in multiply nested content', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })

  const s_nested = new Sequence({
    id: 's',
    content: [a, b, c],
  })
  const t = new Component()

  const s = new Sequence({
    content: [t, s_nested]
  })

  await s.run()

  // Run as usual
  expect(s.internals.controller.currentLeaf).toEqual(t)
  await t.end()
  expect(s.internals.controller.currentLeaf).toEqual(b)

  // Now restart once
  await s.internals.controller.jump('rerun', { sender: s })
  expect(s.internals.controller.currentLeaf).toEqual(t)

  // Try jumping a second time
  await t.end()
  expect(s.internals.controller.currentLeaf).toEqual(b)
  await s.internals.controller.jump('rerun', { sender: s })
  expect(s.internals.controller.currentLeaf).toEqual(t)
})

it('Supports rerunning nested level in multiply nested content', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })

  const s_nested = new Sequence({
    id: 's_nested',
    content: [a, b, c],
  })
  const t = new Component({ id: 't' })

  const s = new Sequence({
    id: 's',
    content: [t, s_nested]
  })

  await s.run()

  // Run as usual
  expect(s.internals.controller.currentLeaf).toEqual(t)
  await t.end()
  expect(s.internals.controller.currentLeaf).toEqual(b)
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)

  // Now restart once
  await s.internals.controller.jump('rerun', { sender: s_nested })
  expect(s.internals.controller.currentLeaf).toEqual(b)
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)

  // Try jumping a second time
  await s.internals.controller.jump('rerun', { sender: s_nested })
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('Can rerun HTML content multiple times', async () => {
  const a = new HTMLScreen({ id: 'a', skip: true })
  const b = new HTMLScreen({ id: 'b' })
  const c = new HTMLScreen({ id: 'c' })

  const s = new Sequence({
    id: 's',
    content: [a, b, c],
  })

  await s.run()

  for (const i in range(10)) {
    // Run as ususal
    expect(s.internals.controller.currentLeaf).toEqual(b)
    await b.end()
    expect(s.internals.controller.currentLeaf).toEqual(c)

    // Now restart once
    await s.internals.controller.jump('rerun', { sender: s })
    expect(s.internals.controller.currentLeaf).toEqual(b)
  }
})
