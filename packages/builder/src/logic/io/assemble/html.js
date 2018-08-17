import { readDataURI } from '../../util/dataURI'
import { template } from 'lodash'

const defaultHeader = `
  <script src="lib/lab.js" data-labjs-script="library"></script>
  <script src="lib/lab.fallback.js" data-labjs-script="fallback"></script>
  <link rel="stylesheet" href="lib/lab.css">
  <!-- study code and styles -->
  <script defer src="script.js"></script>
  <link rel="stylesheet" href="style.css">
`

const makeHeader = state => {
  // TBC ...
  return defaultHeader
    .split('\n')
    .map(l => l.trim())
    .map((l, i) => i === 0 ? l : `  ${ l }`)
    .join('\n')
}

export const makeHTML = state => {
  const { data } = readDataURI(state.files.files['index.html'].content)

  const updatedHTML = template(data, {
    escape: '',
    evaluate: '',
  })({
    header: makeHeader(state)
  })

  return updatedHTML
}
