importScripts('vendor/sw-toolbox.js')
importScripts('vendor/localforage.min.js')
importScripts('vendor/lodash.min.js')

// Utilities -------------------------------------------------------------------

const root = (() => {
  var tokens = (self.location + '').split('/');
  tokens[tokens.length - 1] = '';
  return tokens.join('/');
})()

const processGrid = (grid, colnames=null) =>
  grid.rows
    // Filter rows without data
    .filter( r => !r.every( c => c.trim() === '' ))
    // Use column names to create array of row objects.
    // If column names are passed as a parameter,
    // use those, otherwise rely on the grid object
    .map( r => _.fromPairs(_.zip(colnames || grid.columns, r)) )

const createResponsePair = (r) =>
  // Process an object with the structure
  // { label: 'label', event: 'keypress', ...}
  // into an array with two parts: a label,
  // and an event definition, such as
  // ['red', 'keypress(r)']
  [
    r.label.trim(),
    `${ r.event }` +
      `${ r.filter ? `(${ r.filter.trim() })` : ''}` +
      `${ r.target ? ` ${ r.target.trim() }`  : ''}`
  ]

// Process individual fields
const processResponses = (responses) => {
  // Process responses as a grid, resulting in an array
  // of objects that contain the individual parts
  const grid = processGrid(responses, ['label', 'event', 'target', 'filter'])
  // Process each of these objects into an array
  // of [label, responseParams] pairs
  const pairs = grid.map(createResponsePair)
  return _.fromPairs(pairs)
}

// Template parameters are just a regular grid
const processTemplateParameters = grid => processGrid(grid)

// Process any single node in isolation
const processNode = (node) => {
  return Object.assign({}, node, {
    responses: node.responses ? processResponses(node.responses) : {},
    templateParameters: node.templateParameters
      ? processTemplateParameters(node.templateParameters)
      : node.templateParameters,
  })
}

// Process a node and its children
const makeComponentTree = (data, root) => {
	const currentNode = processNode(data[root])

  if (currentNode) {
    const output = Object.assign({}, currentNode)

    // Convert children, if available
    if (currentNode.children) {
      switch (currentNode.type) {
        case 'lab.flow.Sequence':
          // A sequence can have several components as content
          output.content = currentNode.children
            .map(c => makeComponentTree(data, c))
          break;
        case 'lab.flow.Loop':
          // A loop has a single template
          output.template = makeComponentTree(data, currentNode.children[0])
          break;
      }

      // After parsing, children components are no longer needed
      delete output.children
    }

    // Delete unused fields
    delete output.id

    return output
  } else {
    return {}
  }
}

const processStudy = studyObject => {
  const componentTree = makeComponentTree(studyObject.components, 'root')
  const studyTreeJSON = JSON.stringify(componentTree, null, 2)
  return `const study = lab.util.fromObject(${ studyTreeJSON })\n\nstudy.run()`
}

// Worker initialisation -------------------------------------------------------

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('Service worker installed at', root)
      })
      .then(() => {
        // Make the worker the active service worker,
        // also triggering the activate event
        return self.skipWaiting()
      })
      .catch(error => {
        console.log('Error during installation', error)
      })
  )
})

// Claim this worker as the active worker for all clients,
// as per https://serviceworke.rs/immediate-claim.html
self.addEventListener('activate', event => {
  console.log('Activating service worker')
  return self.clients.claim()
})

// Path configuration ----------------------------------------------------------

toolbox.router.post('api/:instance/update', (request, values) => {
  console.log('Updating internal data')
  return request.json()
    .then(c => localforage.setItem(values.instance, c))
    .then(c => new Response('Internal data updated', { status: 200 }))
    .catch(e => new Response(`An error occured while updating internal data: ${e}`, { status: 500 }))
})

toolbox.router.get('api/:instance/download', (request, values) => {
  console.log(`Preparing study ${ values.instance } for download`)
  const headers = new Headers()
  headers.append("Content-disposition", "attachment; filename=labjs.webexp")
  return localforage.getItem(values.instance)
    .then(r => JSON.stringify(r, null, 2))
    .then(r => new Response(r, { status: 200, headers: headers }))
    .catch(e => new Response('Error ' + e, { status: 500 }))
})

// TODO: For undefined instances, this should return 404,
// and possibly also the redirects for static files below
toolbox.router.get('api/:instance/preview/script.js', (request, values) => {
  console.log(`Serving script for study ${ values.instance }`)
  return localforage.getItem(values.instance)
    .then(r => processStudy(r))
    .then(r => new Response(r, { status: 200 }))
    .catch(e => new Response('Error ' + e, { status: 500 }))
})

toolbox.router.get('api/:instance([a-zA-Z\d-]+)/preview/:path(.+)', (request, values) => {
  console.log(`Accessing (presumably static) file ${ values.path }`)
  if (!values.instance.startsWith('_')) {
    const newPath = `${ root }api/_defaultStatic/${ values.path }`
    console.log(`Redirecting request from ${ request.url } to ${ newPath }`)
    return Response.redirect(newPath)
  }
})
