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
