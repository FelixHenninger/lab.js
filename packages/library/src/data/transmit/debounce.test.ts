import { debounceAsync } from './debounce'

let fn: Function, debouncedFn: Function

beforeEach(() => {
  // TODO: Replace legacy timers and setImmediate shims
  jest.useFakeTimers('legacy')
  fn = jest.fn(async () => 42)
  debouncedFn = debounceAsync(fn, 1000)
})

afterEach(() => {
  jest.useRealTimers()
})

it('does not call the function immediately', () => {
  debouncedFn()
  expect(fn).not.toHaveBeenCalled()
})

it('calls the function after pre-specified delay', () => {
  debouncedFn()
  jest.advanceTimersByTime(999)
  expect(fn).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalled()
})

it('accepts different delays', () => {
  debouncedFn = debounceAsync(fn, 123)
  debouncedFn()

  jest.advanceTimersByTime(122)
  expect(fn).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalled()
})

it('debounces function calls', () => {
  debouncedFn()
  jest.advanceTimersByTime(999)
  // Calling the function again should delay executation
  // by another interval
  debouncedFn()
  jest.advanceTimersByTime(999)
  expect(fn).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(fn).toHaveBeenCalled()
})

it('runs function multiple times if interval is passed', async () => {
  // First run
  debouncedFn()
  jest.advanceTimersByTime(1000)
  expect(fn).toHaveBeenCalledTimes(1)

  // Flush pending async calls
  await new Promise(process.nextTick)

  // Second run
  debouncedFn()
  jest.advanceTimersByTime(1000)
  expect(fn).toHaveBeenCalledTimes(2)
})

it('will re-run if timer expires while the wrapped function is executing', async () => {
  let count = 0
  const fn = jest.fn(
    () =>
      new Promise<number>(resolve => {
        setTimeout(() => resolve(++count), 2000) //
      }),
  )
  const debouncedFn = debounceAsync(fn, 1000)

  // Trigger first call
  const p1 = debouncedFn()

  // Wait until the first function call is running, then queue second call
  jest.advanceTimersByTime(1500)
  expect(fn).toHaveBeenCalledTimes(1)
  const p2 = debouncedFn()
  expect(fn).toHaveBeenCalledTimes(1)

  // Fast-forward to next interval, nothing should happen here
  jest.advanceTimersByTime(500)
  expect(fn).toHaveBeenCalledTimes(1)

  // Second call should be scheduled after 3000ms
  // (first interval + first execution duration)
  jest.advanceTimersByTime(900) // at 2900ms
  expect(fn).toHaveBeenCalledTimes(1)
  jest.advanceTimersByTime(100) // at 3000ms
  await new Promise(process.nextTick)
  expect(fn).toHaveBeenCalledTimes(2)

  // Check return values (these become available at 5000ms)
  expect(p1).resolves.toBe(1)
  expect(p2).resolves.toBe(2)
})

it('resolves all promises once run', async () => {
  let promise1Resolved = false
  const promise1 = debouncedFn()
  promise1.then(() => (promise1Resolved = true))
  jest.advanceTimersByTime(999)

  let promise2Resolved = false
  const promise2 = debouncedFn()
  promise2.then(() => (promise2Resolved = true))
  jest.advanceTimersByTime(999)

  expect(promise1Resolved).toBeFalsy()
  expect(promise2Resolved).toBeFalsy()
  jest.advanceTimersByTime(1)

  // Introduce a miniscule wait for the engine to resolve promises
  await new Promise(process.nextTick)

  // Now all promises should be resolved
  expect(promise1Resolved).toBeTruthy()
  expect(promise2Resolved).toBeTruthy()
})

it('calls wrapped funtion using the last set of arguments', () => {
  debouncedFn(1)
  jest.advanceTimersByTime(999)
  debouncedFn(2)
  jest.runAllTimers()
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith(2)
})

it('can cancel pending calls', () => {
  debouncedFn()
  jest.advanceTimersByTime(999)
  //@ts-ignore TODO
  debouncedFn.cancel()
  jest.runAllTimers()
  expect(fn).not.toHaveBeenCalled()
})

it('can flush pending calls', () => {
  debouncedFn()
  jest.advanceTimersByTime(500)
  expect(fn).not.toHaveBeenCalled()
  //@ts-ignore TODO
  debouncedFn.flush()
  expect(fn).toHaveBeenCalled()
  jest.runAllTimers()
  expect(fn).toHaveBeenCalledTimes(1)
})

it('resolves only after flush is complete', async () => {
  let done = false
  const fn = jest.fn(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        done = true
        resolve('foo')
      }, 100)
    })
  })
  const debouncedFn = debounceAsync(fn, 1000)

  // Run debounced function, but don't wait long enough for it to complete
  const pRun = debouncedFn()
  jest.advanceTimersByTime(500)
  expect(fn).not.toHaveBeenCalled()

  // Flush function and wait for it to be done
  const pFlush = debouncedFn.flush()
  jest.advanceTimersByTime(100)

  // Collect return values
  const flushReturnValue = await pFlush
  const runReturnValue = await pRun

  // Make sure everything is in order
  expect(fn).toHaveBeenCalledTimes(1)
  expect(done).toBeTruthy()
  expect(runReturnValue).toBe('foo')
  expect(flushReturnValue).toBe('foo')

  jest.runAllTimers()
  expect(fn).toHaveBeenCalledTimes(1)
})
