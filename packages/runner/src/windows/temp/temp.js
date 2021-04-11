const { ipcRenderer } = require('electron')

console.log('Data from Temporary process')
//console.log(localStorage.getItem('jsonData'))

ipcRenderer.on('info',(e,mssg)=>{
    //let jsonData = JSON.parse(localStorage.getItem('jsonData'))
    console.log('From temp'+ mssg)
    let jsonData = JSON.parse(mssg)
    document.getElementById('temp').innerHTML = jsonData['components']['1']['title'].toString()
})



  