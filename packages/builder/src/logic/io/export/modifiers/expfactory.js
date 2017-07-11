import assemble from '../../assemble'
import { downloadZip } from '../index'
import { makeDataURI } from '../../../util/dataURI'
import { transform } from 'lodash'

const experiment_json = JSON.stringify({})

const package_json = JSON.stringify({
  name: 'lab.js-exported-study',
  description: 'A study exported from lab.js',
  version: '0.0.1',
  private: true,
  dependencies: {
    'lab.js': '^2017',
    'expfactory-server': '0.0.4',
  },
  devDependencies: {
    "css-loader": "^0.28.4",
    "style-loader": "^0.18.1",
    "webpack": "^2.6.1",
  },
  scripts: {
    "start": "node start.js",
    "build": "webpack -p",
  },
})

const readme = `# Experiment exported from lab.js`

const requirements_js = `// This bundles the requirements for the study`

const start_js = `server = require('expfactory-server')

server.startExp()
console.log('Please navigate to localhost:8080 in your browser')`

const webpack_config_js = `// Webpack is responsible for the bundling process
var path = require('path');

module.exports = {
  entry: './requirements.js',

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },

  // Include CSS files in build
  module: {
    loaders: [
        { test: /\\.css$/, loader: "style-loader!css-loader" }
    ]
  }
}`

export default (state) => {
  const files = assemble(state) // modifier, additionalFiles

  // Move all generated files into a 'public' folder
  const moveFile = (result, file, path) => {
    result[`public/${ path }`] = file
    return result
  }

  files.bundledFiles = transform(files.bundledFiles, moveFile, {})
  files.files = transform(files.files, moveFile, {})

  // Add packaged files
  files.files['readme'] = { content: makeDataURI(readme) }
  files.files['experiment.json'] = { content: makeDataURI(experiment_json) }
  files.files['package.json'] = { content: makeDataURI(package_json) }
  files.files['requirements.js'] = { content: makeDataURI(requirements_js) }
  files.files['start.js'] = { content: makeDataURI(start_js) }
  files.files['webpack.config.js'] = { content: makeDataURI(webpack_config_js) }

  downloadZip(files)
}
