import { Component, ComponentOptions } from './component'
import { Controller } from './controller'

// TODO This isn't great -- fix with pending iterator protocol update
const makeShimSequence = (
  content: Component[],
  options: Partial<ComponentOptions>,
) => {
  const s = new Component(options)
  s.internals.iterator = content[Symbol.iterator]()
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

it('returns the current leaf component', async () => {
  const a = new Component({ id: 'a', skip: true })
  const b = new Component({ id: 'b' })
  const c = new Component({ id: 'c' })
  const s = makeShimSequence([a, b, c], { id: 's' })

  // TODO black magic removal
  await s.prepare()
  a.internals.controller = s.internals.controller
  b.internals.controller = s.internals.controller
  c.internals.controller = s.internals.controller

  await s.run()

  expect(s.internals.controller.currentLeaf).toEqual(b)
  await s.internals.controller.currentLeaf.end()
  expect(s.internals.controller.currentLeaf).toEqual(c)
})
