import { Table } from '../store'
import { cleanData } from '../util/clean'
import { fetch as fetchRetry } from '../util/network'

export const transmit = function (
  url: string,
  rawData: Table,
  metadata = {},
  {
    encoding = 'json',
    headers: customHeaders = {},
    retry = {},
    slice = [undefined, undefined],
  }: {
    encoding?: 'json' | 'form'
    headers?: object
    retry?: { times?: number; delay?: number; factor?: number }
    slice?: [number?, number?]
  } = {},
): Promise<Response> {
  // Determine start and end of transmission
  const sliceStart = slice[0] ?? 0
  const sliceEnd = slice[1] ?? rawData.length

  // Data is always sent as an array of entries
  // (we slice first and then clean data to save some time,
  // rather than using the cleanData property and then slicing)
  const data = cleanData(rawData.slice(sliceStart, sliceEnd))

  // Encode data
  let body,
    defaultHeaders = {}
  if (encoding === 'form') {
    // Encode data as form fields
    body = new FormData()
    body.append('metadata', JSON.stringify({ slice: sliceStart, ...metadata }))
    body.append('url', window.location.href)
    body.append('data', JSON.stringify(data))
  } else {
    // JSON encoding is the default
    body = JSON.stringify({
      metadata: {
        slice: sliceStart,
        ...metadata,
      },
      url: window.location.href,
      data,
    })
    defaultHeaders = {
      Accept: 'application/json', // eslint-disable-line quote-props
      'Content-Type': 'application/json',
    }
  }

  return fetchRetry(url, {
    method: 'post',
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
    body,
    credentials: 'include',
    retry,
  })
}
