import { Emitter } from './emitter'

test('runs handlers in emitter context by default', async () => {
  const e = new Emitter()
  let observedContext: any = undefined
  const handler = function () {
    //@ts-ignore
    observedContext = this
  }

  e.on('event', handler)
  await e.trigger('event')

  expect(observedContext).toEqual(e)
})

test('can run handlers in custom context', async () => {
  let observedContext: any = undefined
  const customContext = {}
  const e = new Emitter('id', { context: customContext })

  const handler = function () {
    //@ts-ignore
    observedContext = this
  }

  e.on('event', handler)
  await e.trigger('event')

  expect(observedContext).toEqual(customContext)
})

test('runs internal event handlers only once if requested', () => {
  const spy = jest.fn()
  const spyOnce = jest.fn()
  const e = new Emitter()

  e.on('event', spy)
  e.once('event', spyOnce)

  // First event: Should trigger both spies
  e.trigger('event')
  expect(spy).toBeCalledTimes(1)
  expect(spyOnce).toBeCalledTimes(1)

  // Second event: Single-call spy should not be called
  e.trigger('event')
  expect(spy).toBeCalledTimes(2)
  expect(spyOnce).toBeCalledTimes(1)
})

test('waits for async event handlers to resolve', async () => {
  let done = false
  const e = new Emitter()

  e.on(
    'event',
    () =>
      new Promise<void>(resolve => {
        window.setTimeout(() => {
          done = true
          resolve()
        }, 20)
      }),
  )

  await e.trigger('event')
  expect(done).toEqual(true)
})

test('waits for one-shot async event handlers to resolve', async () => {
  // ... as above, except for the call to once below
  let done = false
  const e = new Emitter()

  e.once(
    'event',
    () =>
      new Promise<void>(resolve => {
        window.setTimeout(() => {
          done = true
          resolve()
        }, 20)
      }),
  )

  await e.trigger('event')
  expect(done).toEqual(true)
})

test('resolves promises via waitFor', async () => {
  let done = false
  const e = new Emitter()

  const p = e.waitFor('event').then(() => {
    done = true
  })
  e.trigger('event')

  await p
  expect(done).toEqual(true)
})
