const {ipcRenderer} = require('electron')

console.log('Running preload script in study window')

// Test IPC message passing
ipcRenderer.on('ping', (event, message) => {
  console.log(message)
})
