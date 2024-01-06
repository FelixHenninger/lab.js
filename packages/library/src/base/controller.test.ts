import { CustomIterable } from '../flow/util/iterable'
import { Component, ComponentOptions } from './component'
import { Controller } from './controller'

const makeShimSequence = (
  content: Component[],
  options: Partial<ComponentOptions>,
) => {
  const s = new Component(options)
  s.internals.iterator = new CustomIterable(content)[Symbol.iterator]()
  s.on('prepare', function () {
    content.forEach(c => {
      c.parent = s
      c.internals.controller = s.internals.controller
    })
  })
  s.on('reset', function() {
    content.forEach(c => {
      //@ts-ignore TS2341
      c._reset()
    })
  })
  return s
}

it('can build experiment with explicit controller', async () => {
  const study = new Component()
  const c = new Controller({ root: study })

  await c.run()
  expect(study.internals.controller).toEqual(c)
  expect(study.global).toEqual(c.global)
})

it('runs skipped components in sequence', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b', skip: true })
  const s = makeShimSequence([a, b], { id: 's' })

  const a_run = jest.fn()
  const b_run = jest.fn()
  a.on('run', a_run)
  b.on('run', b_run)

  const s_run = jest.fn()
  const s_end = jest.fn()
  s.on('run', s_run)
  s.on('end', s_end)

  // Skipped components should not trigger run message
  await s.run()
  expect(a_run.mock.calls.length).toBe(0)
  expect(b_run.mock.calls.length).toBe(0)
  expect(s_run.mock.calls.length).toBe(1)
  expect(s_end.mock.calls.length).toBe(1)
})

it('runs controlled components in sequence', async () => {
  // Setup sequence
  const a = new Component({ id: 'a' })
  const b = new Component({ id: 'b' })
  const s = makeShimSequence([a, b], { id: 's' })

  // Setup spys
  const a_run = jest.fn()
  const b_run = jest.fn()
  a.on('run', a_run)
  b.on('run', b_run)

  const s_end = jest.fn()
  s.on('end', s_end)

  // Manually prepare sequence so that we can setup the controller
  await s.prepare()
  a.internals.controller = s.internals.controller
  b.internals.controller = s.internals.controller

  // Nothing should have happened at this point
  expect(a_run.mock.calls.length).toBe(0)
  expect(b_run.mock.calls.length).toBe(0)

  // Running the sequence should run the first nested component
  await s.run()
  expect(a_run.mock.calls.length).toBe(1)
  expect(b_run.mock.calls.length).toBe(0)

  // Ending the first component should trigger the second
  await a.end('end')
  expect(a_run.mock.calls.length).toBe(1)
  expect(b_run.mock.calls.length).toBe(1)
  // We're not done yet
  expect(s_end.mock.calls.length).toBe(0)

  // Ending the second should tear down everything
  await b.end('end')
  // By now, each component should have run once
  // and the sequence should have ended automatically
  expect(a_run.mock.calls.length).toBe(1)
  expect(b_run.mock.calls.length).toBe(1)
  expect(s_end.mock.calls.length).toBe(1)
})

it('ends skipped components, but does not show them', async () => {
  const a = new Component({ id: 'a', skip: true })
  const s = makeShimSequence([a], { id: 's' })

  const a_run = jest.spyOn(a, 'run')
  const a_end = jest.spyOn(a, 'end')
  const a_render = jest.spyOn(a, 'render')
  const a_show = jest.spyOn(a, 'show')
  const a_lock = jest.spyOn(a, 'lock')

  await s.run()
  await new Promise(resolve => setTimeout(resolve, 50))

  // Note that we're testing method calls here,
  // and not (as above) messages; this is the internal API
  expect(a_run.mock.calls.length).toBe(1)
  expect(a_end.mock.calls.length).toBe(1)
  expect(a_render.mock.calls.length).toBe(0)
  expect(a_show.mock.calls.length).toBe(0)
  expect(a_lock.mock.calls.length).toBe(1)
})

it('can skip multiple components in fast succession', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b', skip: true })
  const c = new Component({ id: 'c' })

  const s = makeShimSequence([a, b, c], { id: 's' })

  const a_run = jest.spyOn(a, 'run')
  const a_end = jest.spyOn(a, 'end')
  const a_render = jest.spyOn(a, 'render')
  const a_show = jest.spyOn(a, 'show')
  const a_lock = jest.spyOn(a, 'lock')
  const b_run = jest.spyOn(b, 'run')
  const b_end = jest.spyOn(b, 'end')
  const b_render = jest.spyOn(b, 'render')
  const c_run = jest.spyOn(c, 'run')
  const c_end = jest.spyOn(c, 'end')
  const c_render = jest.spyOn(c, 'render')

  await s.run()
  await new Promise(resolve => setTimeout(resolve, 50))

  // Note that we're testing method calls here,
  // and not (as above) messages; this is the internal API
  expect(a_run.mock.calls.length).toBe(1)
  expect(a_end.mock.calls.length).toBe(1)
  expect(a_render.mock.calls.length).toBe(0)
  expect(a_show.mock.calls.length).toBe(0)
  expect(a_lock.mock.calls.length).toBe(1)
  expect(b_run.mock.calls.length).toBe(1)
  expect(b_end.mock.calls.length).toBe(1)
  expect(b_render.mock.calls.length).toBe(0)
  expect(c_run.mock.calls.length).toBe(1)
  expect(c_render.mock.calls.length).toBe(1)
  expect(c_end.mock.calls.length).toBe(0)
})

it('locks all previous components', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const s = makeShimSequence([a, b], { id: 's' })

  const a_lock = jest.spyOn(a, 'lock')
  const b_lock = jest.spyOn(b, 'lock')
  const s_lock = jest.spyOn(s, 'lock')
  jest.useRealTimers()

  await s.run()
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(a_lock.mock.calls.length).toBe(1)
  expect(b_lock.mock.calls.length).toBe(0)

  await b.end()
  await new Promise(resolve => setTimeout(resolve, 50))
  expect(b_lock.mock.calls.length).toBe(1)
  expect(s_lock.mock.calls.length).toBe(1)
})

it('returns the current leaf component', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const s = makeShimSequence([a, b, c], { id: 's' })

  await s.run()

  expect(s.internals.controller.currentLeaf).toEqual(b)
  await s.internals.controller.currentLeaf.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)
})

it('reruns components in the current stack', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const s = makeShimSequence([a, b, c], { id: 's' })

  await s.run()
  await b.end('end')

  expect(s.internals.controller.currentLeaf).toEqual(c)
  await s.internals.controller.jump('rerun', { sender: s })
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can rerun component from its reset method', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const s = makeShimSequence([a, b, c], { id: 's' })

  await s.run()
  await b.end('end')

  expect(s.internals.controller.currentLeaf).toEqual(c)
  await s.reset()
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('reruns doubly nested sequences', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  // Add second middle level
  const t = new Component({ id: 't' })
  const s_nested = makeShimSequence([a, b, c, d], { id: 's_nested' })

  // Top-level sequence
  const s = makeShimSequence([t, s_nested], { id: 's' })

  // Prepare shim sequence
  await s.prepare()

  // Standard run
  await s.run()
  await t.end('end')
  expect(s.internals.controller.currentLeaf).toEqual(b)

  // Now restart top-level component
  await s.internals.controller.jump('rerun', { sender: s })
  expect(s.internals.controller.currentLeaf).toEqual(t)

  await t.end('end')
  expect(s.internals.controller.currentLeaf).toEqual(b)

  await b.end('end')
  expect(s.internals.controller.currentLeaf).toEqual(c)

  // Now restart nested component
  await s.internals.controller.jump('rerun', { sender: s_nested })
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can fast-forward to a given id stack', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s = makeShimSequence([a, b, c, d], { id: 's' })

  await s.prepare()
  await s.run()

  // Standard run
  expect(s.internals.controller.currentLeaf).toEqual(b)

  // Now fast-forward to a later component
  await s.internals.controller.jump('fastforward', {
    target: ['d']
  })

  expect(s.internals.controller.currentLeaf).toEqual(d)
})

it('can fast-forward to a given nested id stack in a running study', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s_nested = makeShimSequence([a, b, c, d], { id: 's_nested' })
  const t = new Component({ id: 't' })

  const s = makeShimSequence([s_nested, t], { id: 's' })

  // Now run
  await s.run()
  expect(s.internals.controller.currentLeaf).toEqual(b)

  await s.internals.controller.jump('fastforward', {
    target: ['s_nested', 'd'], spliceLevel: 1
  })

  expect(s.internals.controller.currentLeaf).toEqual(d)
})

it('can reset a component at a given (leaf node) level', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s_nested = makeShimSequence([a, b, c, d], { id: 's_nested' })
  const t = new Component({ id: 't' })

  const s = makeShimSequence([s_nested, t], { id: 's' })

  // Now run
  await s.run()
  expect(s.internals.controller.currentLeaf).toEqual(b)
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)

  // Reset at s_nested
  await s.internals.controller.jump('rerun', { sender: s_nested })

  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can reset a component at a given (intermediate) level', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s_nested = makeShimSequence(
    [a, b, c, d],
    { id: 's_nested' },
  )
  const t = new Component({ id: 't' })

  const s = makeShimSequence([s_nested, t], { id: 's' })

  // Now run
  await s.run()
  await b.end()

  // Reset at s_nested
  expect(s.internals.controller.currentLeaf).toEqual(c)
  await s.internals.controller.jump('reset', { level: 1 })
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can reset at a given (intermediate) component', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s_nested = makeShimSequence(
    [a, b, c, d],
    { id: 's_nested' },
  )
  const t = new Component({ id: 't' })

  const s = makeShimSequence([s_nested, t], { id: 's' })

  // Now run
  await s.run()
  await b.end()

  // Reset at s_nested
  expect(s.internals.controller.currentLeaf).toEqual(c)
  await s.internals.controller.jump('rerun', { sender: s_nested })
  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can jump forward to a new component', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s = makeShimSequence([a, b, c, d], { id: 's' })

  await s.prepare()
  await s.run()

  // Standard run
  expect(s.internals.controller.currentLeaf).toEqual(b)

  // Now fast-forward to a later component
  await s.internals.controller.jump('jump', {
    targetStack: ['d']
  })

  expect(s.internals.controller.currentLeaf).toEqual(d)
})

it('can jump backward to an old component', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  const s = makeShimSequence([a, b, c, d], { id: 's' })

  await s.prepare()
  await s.run()

  // Standard run
  expect(s.internals.controller.currentLeaf).toEqual(b)
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)


  // Now fast-forward to a component already visited
  await s.internals.controller.jump('jump', {
    targetStack: ['b']
  })

  expect(s.internals.controller.currentLeaf).toEqual(b)
})

it('can jump up, jump up and get down', async () => {
  const a = new Component({ id: 'a' }) // No longer skips
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const d = new Component({ id: 'd' })

  // Create an intermediate level
  const s_nested = makeShimSequence(
    [a, b, c, d],
    { id: 's_nested' },
  )
  const t = new Component({ id: 't' })
  const s = makeShimSequence([s_nested, t], { id: 's' })

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

  // Jump to b
  await jumpTo(['s_nested', 'b'])
  expect(s.internals.controller.currentLeaf).toEqual(b)

  // Move to c naturally
  await b.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)

  // Jump back to a (on the same level)
  await jumpTo(['s_nested', 'a'])
  expect(s.internals.controller.currentLeaf).toEqual(a)

  // Jump to the end (t), out of the nested component
  await jumpTo(['s_nested', 't'])
  expect(s.internals.controller.currentLeaf).toEqual(t)

  // Jump backwards again, to b
  await jumpTo(['s_nested', 'b'])
  expect(s.internals.controller.currentLeaf).toEqual(b)
})
