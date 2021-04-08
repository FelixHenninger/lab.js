// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
console.log('got here')

document.body.addEventListener('dragover', e => {
  e.preventDefault()
  e.stopPropagation()
})

document.body.addEventListener('drop', e => {
  e.preventDefault()
  e.stopPropagation()

  // Retrieve files
  const files = Array.from(e.dataTransfer.files)

  // Send file paths to main process
  ipcRenderer.send(
    'study.load',
    files.map(f => f.path),
  )

  // Empty data transfer
  e.dataTransfer.items.clear()
})
