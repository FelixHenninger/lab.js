// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
const path = require('path')
const fs=require('fs')
//const {Datas} =require('../Studies/renderer')

console.log('got here')

document.body.addEventListener('dragover', e => {
  e.preventDefault()
  e.stopPropagation()
})

document.body.addEventListener('drop', (e) => {
  e.preventDefault()
  e.stopPropagation()
  ipcRenderer.send('JSON','Dummy')
  // Retrieve files
  const files = Array.from(e.dataTransfer.files)
  let jsonData;
  
  //Reading a JSON File
  if (files.length==1){
    console.log('file is dragged from: '+files[0].path)
    const json_path=files[0].path;

    fs.readFile(json_path,(err,data)=>{
      if (err) throw err;

      jsonData = JSON.parse(data);
      console.log(jsonData['components']['6']['title'])
    })
    
  }

  // Send file paths to main process
  ipcRenderer.send('study.load', files.map(f => f.path))

  // Empty data transfer
  e.dataTransfer.items.clear()
})

