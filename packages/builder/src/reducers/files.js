import { makeDataURI } from '../logic/util/dataURI'

const index_html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Experiment</title>
  <!-- lab.js library and default styles -->
  <script src="lib/lab.js" data-labjs-script="library"></script>
  <script src="lib/lab.fallback.js" data-labjs-script="fallback"></script>
  <link rel="stylesheet" href="lib/lab.css">
  <!-- study code and styles -->
  <script defer src="script.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- If you'd rather have a container with a fixed width
       and variable height, try removing the fullscreen class below -->
  <div class="container fullscreen" data-labjs-section="main">
    <main class="content-vertical-center content-horizontal-center">
      <div>
        <h2>Loading Experiment</h2>
        <p>The experiment is loading and should start in a few seconds</p>
      </div>
    </main>
  </div>
</body>
</html>
`

const style_css = `/* Please define your custom styles here */`

const defaultState = {
  files: {
    'index.html': {
      content: makeDataURI(index_html, 'text/html'),
      permanent: true,
    },
    'style.css': {
      content: makeDataURI(style_css, 'text/css'),
      permanent: true,
    }
  },
  bundledFiles: {
    'lib/lab.js': {
      type: 'application/javascript',
    },
    'lib/lab.js.map': {
      type: 'text/plain',
    },
    'lib/lab.css': {
      type: 'text/css',
    },
    'lib/loading.svg': {
      type: 'image/svg+xml',
    },
  }
}

export default (state=defaultState, action) => {
  switch (action.type) {
    case 'ADD_FILE':
      return {
        ...state,
        files: {
          ...state.files,
          [action.file]: action.data
        }
      }
    case 'UPDATE_FILE':
      return {
        ...state,
        files: {
          ...state.files,
          [action.file]: {
            ...state.files[action.file],
            ...action.data,
          },
        },
      }
    case 'RESET_STATE':
      return defaultState
    default:
      return state
  }
}
