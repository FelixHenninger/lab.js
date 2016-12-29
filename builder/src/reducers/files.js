const index_html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Experiment</title>
  <!-- lab.js library and default styles -->
  <script src="lib/lab.min.js"></script>
  <link rel="stylesheet" href="lib/lab.css">
  <!-- study code and styles -->
  <script defer src="script.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- If you're looking to fill all available browser space,
       try replacing the class below with "container fullscreen" -->
  <div class="container" id="labjs-content">
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
      content: index_html,
      type: 'text/html',
    },
    'style.css': {
      content: style_css,
      type: 'text/css',
    }
  },
  bundledFiles: {
    'lib/lab.min.js': {
      type: 'application/javascript',
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
    default:
      return state
  }
}
