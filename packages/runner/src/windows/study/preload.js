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

caches.open('labjs-preview').then(cache => {
  cache.put(
    new Request('https://study.local/index.html'),
    new Response(blobFromDataURI(
      'data:text/plain;base64,SGVsbG8gd29ybGQh'
    ))
  )
  console.log('Populated preview cache')
}).catch(err => {
  console.log('Error while populating preview cache', err)
})

// Setup service worker --------------------------------------------------------

navigator.serviceWorker.register('worker.js', {
  scope: './'
}).then((sw) => {
  console.log('Registered preview worker:', sw)
}).catch((err) => {
  console.log('Error while registering preview worker', err)
})
