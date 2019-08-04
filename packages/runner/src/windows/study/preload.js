const {ipcRenderer} = require('electron')

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
