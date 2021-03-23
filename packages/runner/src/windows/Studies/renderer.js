const { ipcRenderer }=require('electron');

console.log('js is working')
    //document.getElementById('text').style.backgroundColor='magenta';

ipcRenderer.on('send',(e,mssg)=>{
    console.log('Got the json file')
})


