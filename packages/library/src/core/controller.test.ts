import { Controller } from './controller'
import { setupTestingContext } from './test/helpers'

import { Screen } from '../html'
import { Sequence } from '../flow'
import { Status } from '../base/component'

setupTestingContext()

it('can initialize controller', async () => {
  //@ts-ignore
  const c = new Controller({ root: { internals: {} } })
  expect(c instanceof Controller).toBeTruthy()
})

it('can jump from and to tardy components', async () => {
  const a = new Screen({ id: 'a' })
  const b = new Screen({ id: 'b' })
  const c = new Screen({ id: 'c', tardy: true })
  const d = new Screen({ id: 'd' })
  const e = new Screen({ id: 'e', tardy: true })

  const f = new Screen({ id: 'f' })
  const g = new Screen({ id: 'g', tardy: true })
  const h = new Screen({ id: 'h' })

  // Create an intermediate level
  const s_nested_a = new Sequence({
    content: [a, b, c, d, e],
    id: 's_nested_a',
  })
  const s_nested_b = new Sequence({
    content: [f, g, h],
    id: 's_nested_b',
    tardy: true,
  })
  const t = new Screen({ id: 't', tardy: true })
  const s = new Sequence({ content: [s_nested_a, t, s_nested_b], id: 's' })

  const jumpTo = async (targetStack: string[]) => {
    await s.internals.controller.jump('jump', { targetStack })
  }

  await s.run()
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested_a', 'a'])

  // Jump to tardy component c
  expect(c.status).toEqual(Status.initialized)
  await jumpTo(['s_nested_a', 'c'])
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested_a', 'c'])
  expect(c.status).toEqual(Status.rendered)

  // Move on to d
  await c.end()
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested_a', 'd'])

  // Jump into tardy sequence, onto tardy component
  expect(s_nested_b.status).toEqual(Status.initialized)
  expect(g.status).toEqual(Status.initialized)
  await jumpTo(['s_nested_b', 'g'])
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested_b', 'g'])
  expect(g.status).toEqual(Status.rendered)

  // Jump back into partially run sequence, onto tardy component
  expect(e.status).toEqual(Status.initialized)
  await jumpTo(['s_nested_a', 'e'])
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested_a', 'e'])
  expect(e.status).toEqual(Status.rendered)
})

it('can jump up, jump up and get down', async () => {
  const a = new Screen({ id: 'a' }) // No longer skips
  const b = new Screen({ id: 'b' })
  const c = new Screen({ id: 'c' })
  const d = new Screen({ id: 'd' })

  // Create an intermediate level
  const s_nested = new Sequence({
    id: 's_nested',
    content: [a, b, c, d],
  })
  const t = new Screen({ id: 't' })
  const s = new Sequence({
    id: 's',
    content: [s_nested, t],
  })

  const jumpTo = async (targetStack: string[]) => {
    await s.internals.controller.jump('jump', { targetStack })
  }

  // Structure is as follows
  // ------------- s -------------
  // - s_nested --   ---- t ------
  // a - b - c - d

  // Now run a
  await s.run()
  expect(s.internals.controller.currentLeaf).toEqual(a)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested', 'a'])
  expect(s_nested.status).toBeGreaterThanOrEqual(Status.running)
  expect(s_nested.status).toBeLessThan(Status.done)

  // Jump to b
  await jumpTo(['s_nested', 'b'])
  expect(s.internals.controller.currentLeaf).toEqual(b)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested', 'b'])
  expect(s_nested.status).toBeGreaterThanOrEqual(Status.running)
  expect(s_nested.status).toBeLessThan(Status.done)

  // Move to c naturally
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested', 'c'])

  // Jump back to a (on the same level)
  await jumpTo(['s_nested', 'a'])
  expect(s.internals.controller.currentLeaf).toEqual(a)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested', 'a'])
  expect(s_nested.status).toBeGreaterThanOrEqual(Status.running)
  expect(s_nested.status).toBeLessThan(Status.done)

  // Jump to the end (t), out of the nested component
  await jumpTo(['t'])
  expect(s.internals.controller.currentLeaf).toEqual(t)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 't'])

  // Jump backwards again, to b
  await jumpTo(['s_nested', 'b'])
  expect(s.internals.controller.currentLeaf).toEqual(b)
  expect(s.internals.controller.currentStack.map(c => c.id)) //
    .toStrictEqual(['s', 's_nested', 'b'])
  expect(s_nested.status).toBeGreaterThanOrEqual(Status.running)
  expect(s_nested.status).toBeLessThan(Status.done)
})
