//This script is used to render the study components from the JSON File on the Study Window

document.addEventListener('DOMContentLoaded', () => {
  console.log('Data from study process')
  console.log(localStorage.getItem('jsonData'))
  let jsonData = JSON.parse(localStorage.getItem('jsonData'))
  document.getElementById('title').innerHTML = jsonData['components']['1']['title'].toString()
})
