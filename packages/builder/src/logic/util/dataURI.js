export const makeDataURI = (data, mime='') =>
  // Make data url from string
  `data:${ mime },${ encodeURIComponent(data) }`

const re = /^\s*data:([-+.\w\d]+\/[-+.\w\d]+)?(;base64)?,(.*)$/

export const readDataURI = uri => {
  // Split data URI into constituent parts
  const [, mime, encoding, data] = re.exec(uri)

  // Is the content encoded as base64?
  const base64 = encoding === ';base64'

  return {
    data: base64 ? data : decodeURIComponent(data),
    mime, base64
  }
}

export const mimeFromDataURI = uri => re.exec(uri)?.[1]

export const blobFromDataURI = uri => {
  const { data, mime, base64 } = readDataURI(uri)

  if (base64) {
    // Convert base64 to binary
    const binary = window.atob(data)
    // Decode raw bytes
    const bytes = new Uint8Array(binary.length)
    for (var i = 0; i < binary.length; i++)        {
      bytes[i] = binary.charCodeAt(i)
    }
    // Return as blob
    return new Blob([bytes], { type: mime })
  } else {
    // Return blob from string data
    return new Blob([data], { type: mime })
  }
}

export const sizeFromDataURI = uri =>
  // Calculate a file size in KB
  //
  // base64 encoding inflates the file, storing 6 bits in every 8-bit
  // character; the initial data URI indicator and the trailing equal
  // sign don't count toward the file size.
  //
  // TODO: Even with all of these corrections, this is an approximation,
  // and will differ from OS file managers. Corrections are welcome!
  Math.ceil(
    0.75 * (uri.length - uri.indexOf(',') - 1)
    / 1000
  )

export const updateDataURI = (uri, updater, ...args) => {
  const { data, mime } = readDataURI(uri)
  const newData = updater(data, ...args)
  return makeDataURI(newData, mime)
}
