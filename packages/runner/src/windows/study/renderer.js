//This script is used to render the study components from the JSON File on the Study Window

document.addEventListener('DOMContentLoaded', () => {
  console.log('Data from study process')
  console.log(sessionStorage.getItem('jsonData'))
  let jsonData = JSON.parse(sessionStorage.getItem('jsonData'))
  document.getElementById('title').innerHTML = jsonData['components']['1']['title'].toString()
})
