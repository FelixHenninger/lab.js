import { makeFilename } from '../../filename'
import assemble from '../../assemble'
import { downloadZip } from '../index'
import { makeDataURI, updateDataURI } from '../../../util/dataURI'
import { transform } from 'lodash'
import { stripIndent } from 'common-tags'
import uuid from 'uuid4'

const makeConfig = (state) => {
  const metadata = state.components.root.metadata
  const filename = makeFilename(state)

  const data = {
    version: '3',
    data: {
      uuid: uuid(),
      title: metadata.title || 'Unnamed study',
      description: metadata.description || '',
      groupStudy: false,
      dirName: filename,
      comments: '',
      jsonData: null,
      componentList: [
        {
          "uuid": uuid(),
          "title": metadata.title || 'Unamed study',
          "htmlFilePath": "index.html",
          "reloadable": true,
          "active": true,
          "comments": "",
          "jsonData": null
        }
      ],
      batchList: [
        {
          "uuid": uuid(),
          "title": "Default",
          "active": true,
          "maxActiveMembers": null,
          "maxTotalMembers": null,
          "maxTotalWorkers": null,
          "allowedWorkerTypes": null,
          "comments": null,
          "jsonData": null
        }
      ]
    },
  }

  return makeDataURI(JSON.stringify(data, null, 2))
}

const updateIndex = (source) =>
  // Include JATOS helper script
  source.replace(
    // eslint-disable-next-line no-useless-escape
    /^(\s*)<script src="[\d\w\/\.]+" data-labjs-script="library"><\/script>/mg,
    '$&\n' +
    '$1<script src="jatos.js"></script>',
  )

const updateScript = (source) =>
  source.replace(
    'study.run()',
    'jatos.onLoad(() => study.run())'
  )

const addJatosIntegration = (state) => {
  // Add logic for saving data
  state.components.root.messageHandlers =
    (state.components.root.messageHandlers || [])

  // TODO: This is probably not the most elegant way to
  // achieve integration -- possibly a plugin would be nicer?
  state.components.root.messageHandlers.push({
    title: 'JATOS integration',
    message: 'epilogue',
    code: stripIndent`
      var resultJson = study.options.datastore.exportJson();
      jatos.submitResultData(resultJson, jatos.startNextComponent);
    `
  })

  return state
}

export default (state) => {
  // Generate files
  const files = assemble(state, addJatosIntegration)
  const expId = makeFilename(state)

  // Add changes to index.html and script
  files.files['index.html'].content = updateDataURI(
    files.files['index.html'].content,
    updateIndex
  )
  files.files['script.js'].content = updateDataURI(
    files.files['script.js'].content,
    updateScript
  )

  // Move all generated files into a folder
  const moveFile = (result, file, path) => {
    result[`${ expId }/${ path }`] = file
    return result
  }

  files.bundledFiles = transform(files.bundledFiles, moveFile, {})
  files.files = transform(files.files, moveFile, {})

  // Add packaged files
  files.files[`${ expId }.jas`] = { content: makeConfig(state) }

  downloadZip(files)
}
