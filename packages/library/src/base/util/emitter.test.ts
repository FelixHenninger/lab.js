import { Component } from '../component'
import { Emitter } from './emitter'

let defaultEmitter;

beforeEach(() => {
  const component = new Component()
  defaultEmitter = new Emitter(component)
})

it('runs handlers in emitter context by default', async () => {
  let observedContext: any = undefined
  const handler = function () {
    //@ts-ignore
    observedContext = this
  }

  defaultEmitter.on('event', handler)
  await defaultEmitter.trigger('event')

  expect(observedContext).toEqual(defaultEmitter)
})

it('can run handlers in custom context', async () => {
  let observedContext: any = undefined
  const customContext = {}
  const component = new Component()
  const e = new Emitter(component, { context: customContext })

  const handler = function () {
    //@ts-ignore
    observedContext = this
  }

  e.on('event', handler)
  await e.trigger('event')

  expect(observedContext).toEqual(customContext)
})

it('runs internal event handlers only once if requested', () => {
  const spy = jest.fn()
  const spyOnce = jest.fn()

  defaultEmitter.on('event', spy)
  defaultEmitter.once('event', spyOnce)

  // First event: Should trigger both spies
  defaultEmitter.trigger('event')
  expect(spy).toBeCalledTimes(1)
  expect(spyOnce).toBeCalledTimes(1)

  // Second event: Single-call spy should not be called
  defaultEmitter.trigger('event')
  expect(spy).toBeCalledTimes(2)
  expect(spyOnce).toBeCalledTimes(1)
})

it('runs wildcard handlers on every event', () => {
  const spy = jest.fn()
  const spyWildcard = jest.fn()

  defaultEmitter.on('event', spy)
  defaultEmitter.on('*', spyWildcard)

  // First event: Should trigger both spies
  defaultEmitter.trigger('event')
  expect(spy).toBeCalledTimes(1)
  expect(spyWildcard).toBeCalledTimes(1)

  // Second event: Single-call spy should not be called
  defaultEmitter.trigger('novel-event')
  expect(spy).toBeCalledTimes(1)
  expect(spyWildcard).toBeCalledTimes(2)
})

it('waits for async event handlers to resolve', async () => {
  let done = false

  defaultEmitter.on(
    'event',
    () =>
      new Promise<void>(resolve => {
        window.setTimeout(() => {
          done = true
          resolve()
        }, 20)
      }),
  )

  await defaultEmitter.trigger('event')
  expect(done).toEqual(true)
})

it('waits for one-shot async event handlers to resolve', async () => {
  // ... as above, except for the call to once below
  let done = false

  defaultEmitter.once(
    'event',
    () =>
      new Promise<void>(resolve => {
        window.setTimeout(() => {
          done = true
          resolve()
        }, 20)
      }),
  )

  await defaultEmitter.trigger('event')
  expect(done).toEqual(true)
})

it('resolves promises via waitFor', async () => {
  let done = false

  const p = defaultEmitter.waitFor('event').then(() => {
    done = true
  })
  defaultEmitter.trigger('event')

  await p
  expect(done).toEqual(true)
})
