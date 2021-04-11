
    console.log('Data from Temporary process')
    console.log(localStorage.getItem('jsonData'))
    let jsonData = JSON.parse(localStorage.getItem('jsonData'))
    document.getElementById('temp').innerHTML = jsonData['components']['1']['title'].toString()

  