import { Store } from '..'
import { Connection } from './connection'

let store: Store, connection: Connection, fetchMock: any

beforeEach(() => {
  store = new Store()
  store.set({ one: 1, two: 2 })
  store.commit()
  store.set({ three: 3, four: 4 })
  store.commit()
  store.set('five', 5)

  connection = new Connection(
    store, //
    'https://random.example',
    { debounceInterval: 1000 },
  )

  // Spy on or patch fetch
  if ('fetch' in window) {
    fetchMock = jest.spyOn(window, 'fetch')
  } else {
    fetchMock = jest.fn()
    //@ts-expect-error - LEGACY
    window.fetch = fetchMock
  }
  fetchMock.mockImplementation(async () => Promise.resolve({}))
})

afterEach(() => {
  jest.resetAllMocks()
})

it('counts last incrementally transmitted row', async () => {
  expect(connection.lastTransmission).toEqual(0)
  await connection.enqueue()
  expect(connection.lastTransmission).toEqual(2)

  // Committing shouldn't change the last transmission ...
  store.commit()
  expect(connection.lastTransmission).toEqual(2)

  // ... but enqueueing a transmission should
  await connection.enqueue()
  expect(connection.lastTransmission).toEqual(3)
})

it('debounces transmission', async () => {
  jest.useFakeTimers()
  await connection.enqueue()
  jest.advanceTimersByTime(100)
  expect(fetchMock).not.toHaveBeenCalled()
  jest.advanceTimersByTime(900)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  jest.useRealTimers()
})

// Extract data from stringified payload
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractData = ([_, options]: [RequestInfo, RequestInit]) =>
  JSON.parse(options.body as string)['data']

it('sends all new data with debounced transmission', async () => {
  jest.useFakeTimers()
  await connection.enqueue()
  store.set({ six: 6 })
  store.commit()
  await connection.enqueue()
  jest.runAllTimers()

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(extractData(fetchMock.mock.calls[0])).toEqual(store.data)
})

it('sends data in increments', async () => {
  // TODO: Use modern timer implementation,
  // and replace tick shim below
  jest.useFakeTimers({ legacyFakeTimers: true })

  // Queue and transmit first batch of data
  await connection.enqueue()

  // Fast-forward through first transmission
  jest.advanceTimersByTime(1000)
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // Flush async queue
  // eslint-disable-next-line @typescript-eslint/unbound-method
  await new Promise(process.nextTick)

  // Add new data, and transmit it
  store.set({ six: 6 })
  store.commit()
  await connection.enqueue()

  // Fast-forward again
  jest.advanceTimersByTime(2000)

  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(extractData(fetchMock.mock.calls[1])).toEqual([{ five: 5, six: 6 }])
  jest.useRealTimers()
})
