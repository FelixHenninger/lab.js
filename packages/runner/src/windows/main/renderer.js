// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
console.log('got here')
const path = require('path')
const fs = require('fs')

document.body.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})

document.body.addEventListener('drop', (e) => {
  e.preventDefault()
  e.stopPropagation()

  // Retrieve files
  const files = Array.from(e.dataTransfer.files)

  window.location.href = '../study/index.html'
 
  //Checking for number of files
  if (files.length == 1) {
    //Checking for json file
    if ((files[0].type = 'application/json')) {
      const json_path = files[0].path
      //Checking whether the file is valid json or not
      let jsonData
      fs.readFile(json_path, (err, data) => {
        if (err) throw err
        try {
          jsonData = JSON.parse(data)
        } catch (e) {
          alert('Not a valid JSON File!! Try again')
        }
        ipcRenderer.send('temp',JSON.stringify(JSON.parse(data)))
        console.log('the json body is:' + JSON.stringify(JSON.parse(data)))
        //localStorage.setItem('jsonData', JSON.stringify(JSON.parse(data)))
      })
    }
    console.log('file is dragged from: ' + files[0].path)
  }
  
  //window.open('../temp/temp.html','Temporary')

  // Empty data transfer
  e.dataTransfer.items.clear()
})
