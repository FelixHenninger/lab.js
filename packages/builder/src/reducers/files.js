import { makeDataURI } from '../logic/util/dataURI'

const index_html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Experiment</title>
  <!-- viewport setup -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- lab.js library and experiment code -->
  \${ header }
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
    'lib/lab.fallback.js': {
      type: 'application/javascript',
    },
    'lib/lab.legacy.js': {
      type: 'application/javascript',
    },
    'lib/lab.legacy.js.map': {
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
    case 'DELETE_FILE':
      const output = {
        ...state,
        files: {
          ...state.files
        }
      }

      delete output.files[action.file]

      return output
    case 'RESET_STATE':
      return defaultState
    default:
      return state
  }
}
