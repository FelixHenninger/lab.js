export const makeDataURI = (data, mime='') =>
  // Make data url from string
  `data:${ mime },${ encodeURIComponent(data) }`

export const readDataURI = uri => {
  // Split data URI into constituent parts
  const re = /^\s*data:([\w]+\/[\w]+)?(;base64)?,(.*)$/
  const [, mime, encoding, data] = re.exec(uri)

  // Is the content encoded as base64?
  const base64 = encoding === ';base64'

  return {
    data: base64 ? data : decodeURIComponent(data),
    mime, base64
  }
}

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

export const updateDataURI = (uri, updater, ...args) => {
  const { data, mime } = readDataURI(uri)
  const newData = updater(data, ...args)
  return makeDataURI(newData, mime)
}
