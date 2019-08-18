const {ipcRenderer} = require('electron')

// Data URI handling -----------------------------------------------------------

const re = /^\s*data:([-+.\w\d]+\/[-+.\w\d]+)?(;base64)?,(.*)$/

const readDataURI = uri => {
  // Split data URI into constituent parts
  const [, mime, encoding, data] = re.exec(uri)

  // Is the content encoded as base64?
  const base64 = encoding === ';base64'

  return {
    data: base64 ? data : decodeURIComponent(data),
    mime, base64
  }
}

const blobFromDataURI = (uri, atob=window.atob) => {
  const {data, mime, base64} = readDataURI(uri)

  if (base64) {
    // Convert base64 to binary
    const binary = atob(data)
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

// -----------------------------------------------------------------------------

console.log('Running preload script in study window')

// Test IPC message passing
ipcRenderer.on('ping', (event, message) => {
  console.log(message)
})

// Setup keyboard shortcut for closing window ----------------------------------

// Listen for the key combination to unlock the study window
window.addEventListener('keydown', e => {
  if (
    e.key === 'Escape' && e.ctrlKey &&
    window.confirm('Are you sure you want to close the study?')
  ) {
    console.log('Sending request to unlock study window')
    ipcRenderer.send('study.unlock')
    console.log('Closing study window')
    window.close()
  }
})

// Setup study cache -----------------------------------------------------------

const bulkPut = async (cache, files) =>
  Promise.all(
    Object.entries(files).map(([path, dataURI]) =>
      cache.put(
        new Request(`https://study.local/${path}`),
        new Response(blobFromDataURI(dataURI))
      )
    )
  )

const setupCache = async () => {
  const cache = await caches.open('labjs-preview')

  if ((await cache.keys()).length === 0) {
    await bulkPut(cache, {
      'https://study.local/index.html': 'data:text/plain;base64,SGVsbG8gd29ybGQh'
    })
    console.log('Loaded default preview cache')
  } else {
    console.log('Preview cache not empty, no change made')
  }
}

setupCache()

ipcRenderer.on('study.update', async (event, files) => {
  // Clear cache
  await caches.delete('labjs-preview')

  // Update cache by inserting files
  const cache = await caches.open('labjs-preview')
  await bulkPut(cache, files)
  console.log('Updated cache')
  ipcRenderer.send('study.did-update-cache')
})

// Setup service worker --------------------------------------------------------

const worker = navigator.serviceWorker.register('worker.js', {
  scope: './'
}).then(reg => {
  console.log('Preview worker registration:', reg)
  const worker = reg.installing || reg.waiting || reg.active

  // Send notification once worker is activated
  if (worker.state === 'activated') {
    ipcRenderer.send('study.did-activate-worker')
  } else {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        ipcRenderer.send('study.did-activate-worker')
      }
    })
  }
}).catch((err) => {
  console.log('Error while registering preview worker', err)
})
