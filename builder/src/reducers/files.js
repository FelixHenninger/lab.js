const index_html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Experiment</title>
  <!-- lab.js and libraries -->
  <script src="lib/lab.min.js"></script>
  <link rel="stylesheet" href="lib/lab.css">
  <!-- actual experiment code -->
  <script defer src="script.js"></script>
</head>
<body>
  <!-- If you're looking to fill all available browser space,
       try replacing the class below with "container fullscreen" -->
  <div class="container" id="labjs-content">
    <header class="content-vertical-center content-horizontal-center">
      <div>
        <!-- You could put a title here,
             or remove the header element entirely -->
      </div>
    </header>
    <main class="content-vertical-center content-horizontal-center">
      <!-- the nested div is helpful because the centering would
           otherwise break the natural flow of content -->
      <div>
        <img src="lib/loading.svg" alt="loading icon" style="padding: 1rem"><br>
        <p>
          <strong>Preparing experiment</strong><br>
          <span class="text-muted">please wait a moment</span>
        </p>
      </div>
    </main>
    <footer class="content-vertical-center content-horizontal-center">
      <div>
        <!-- Again, please feel free to replace the footer content,
             or to remove the footer if you don't need it -->
        <small class="text-muted">Awesome lab, prestigious institution™</small>
      </div>
    </footer>
  </div>
</body>
</html>
`

const style_css = ``

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
