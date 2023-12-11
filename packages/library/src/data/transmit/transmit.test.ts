import { Store } from '..'
import { transmit } from './transmit'

let store: Store
let fetchMock: any

beforeEach(() => {
  store = new Store()

  // Spy on or patch fetch
  if ('fetch' in window) {
    fetchMock = jest.spyOn(window, 'fetch')
  } else {
    fetchMock = jest.fn()
    //@ts-expect-error - LEGACY
    window.fetch = fetchMock
  }

  const response = {
    ok: true,
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  }

  fetchMock.mockImplementation(async () => Promise.resolve(response))

  store.set({ one: 1, two: 2 })
  store.commit()
  store.set({ three: 3, four: 4 })
  store.commit()
  store.set('five', 5)
})

afterEach(() => {
  jest.resetAllMocks()
})

it('transmits data per post request', async () => {
  // Make a mock request and ensure that it works
  // (i.e. that a promise is returned, and that the
  // response passed with it is ok)

  const response = await transmit('https://random.example', store.data)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith('https://random.example', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metadata: {
        slice: 0,
      },
      url: window.location.href,
      data: store.data,
    }),
    credentials: 'include',
  })
  // TODO: There must be a better way than just checking
  // whether the arguments were passed correctly, no?

  expect(response.ok).toBeTruthy()
})

it('will retry transmission if it fails', async () => {
  // And if at first you don't succeed ...
  fetchMock
    .mockImplementationOnce(() => Promise.reject('not feeling like it'))
    .mockImplementationOnce(() => Promise.reject('you want it when?'))
    .mockImplementationOnce(() => Promise.reject('nah, not in the mood'))
    .mockImplementationOnce(() => Promise.reject(`lalala can't hear you`))

  await transmit(
    'https://random.example',
    store.data,
    {},
    { retry: { delay: 0 } },
  )

  expect(fetchMock).toHaveBeenCalledTimes(5)
})

it('uses an exponential backoff', async () => {
  const timestamps: number[] = []
  fetchMock.mockImplementation(() => {
    timestamps.push(performance.now())
    return Promise.reject('nope')
  })

  // Ignore transmission error
  await transmit(
    'https://random.example',
    store.data,
    {},
    {
      retry: { times: 2 },
    },
  ).catch(message => message)

  // Calculate timestamp deltas
  const deltas = timestamps
    .map((x, i, arr) => arr[i + 1] - x)
    .filter(x => !isNaN(x))

  // TODO: Not sure how I'm feeling about this?
  expect(fetchMock).toHaveBeenCalledTimes(4)
  // TODO: This is a very crude test
  expect(deltas[0] <= deltas[1]).toBeTruthy()
  expect(deltas[1] <= deltas[2]).toBeTruthy()
})

it('gives up retrying eventually', async () => {
  fetchMock.mockImplementation(() =>
    Promise.reject('gonna nope right out of this'),
  )

  const response = await transmit(
    'https://random.example',
    store.data,
    {},
    { retry: { delay: 1, factor: 1 } },
  ).catch(message => message)

  expect(response).toEqual('gonna nope right out of this')
  expect(fetchMock).toHaveBeenCalledTimes(5)
})
