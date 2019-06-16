import { fromPairs, zip, pickBy, groupBy, isEmpty } from 'lodash'
import serialize from 'serialize-javascript'

import { makeType } from '../../util/makeType'
import { adaptiveFunction } from '../../util/async'
import { slugify } from '../../util/slug'

// Generic grid processing
const processGrid = (grid, colnames=null, types=undefined) =>
  grid.rows
    // Filter rows without data
    .filter( r => !r.every( c => c.trim() === '' ) )
    // Convert types if requested
    .map( r => r.map( (c, i) => makeType(c, types ? types[i] : undefined) ) )
    // Use column names to create array of row objects.
    // If column names are passed as a parameter,
    // use those, otherwise rely on the grid object
    .map( r => fromPairs(zip(colnames || grid.columns, r)) )

const processFiles = files =>
  fromPairs(
    files.rows
      .map(r => r[0])
      .map(r => [r.localPath.trim(), r.poolPath.trim()])
  )

const processMessageHandlers = (messageHandlers) =>
  fromPairs(
    messageHandlers.rows
      .map(r => r[0])
      .filter(h => h.message.trim() !== '' && h.code.trim() !== '')
      // TODO: Evaluate the safety implications
      // of the following de-facto-eval.
      .map(h => [
        h.message,
        adaptiveFunction(h.code)
      ])
  )

const processParameters = parameters =>
  fromPairs(
    parameters.rows
      .map(r => r[0])
      .filter(r => r.name.trim() !== '' && r.value.trim() !== '')
      .map(r => [r.name.trim(), makeType(r.value, r.type)])
  )

const createResponsePair = r =>
  // Process an object with the structure
  // { label: 'label', event: 'keypress', ...}
  // into an array with two parts: a label,
  // and an event definition, such as
  // ['keypress(r)', 'red']
  [
    `${ r.event }` +
      `${ r.filter ? `(${ r.filter.trim() })` : ''}` +
      `${ r.target ? ` ${ r.target.trim() }`  : ''}`,
    r.label.trim()
  ]

// Process individual fields
const processResponses = (responses) => {
  // Process responses as a grid, resulting in an array
  // of objects that contain the individual parts
  const grid = processGrid(responses, ['label', 'event', 'target', 'filter'])
  // Process each of these objects into an array
  // of [responseParams, label] pairs
  const pairs = grid.map(createResponsePair)
  // Finally, create an object of
  // { responseParams: label } mappings
  return fromPairs(pairs)
}

// Template parameters are also a grid,
// but column names and data types are defined
// as properties of an object.
const processTemplateParameters = grid =>
  processGrid(
    grid,
    grid.columns.map(c => c.name.trim()),
    grid.columns.map(c => c.type)
  )

const processShuffleGroups = columns =>
  Object.values(
    // Collect columns with the same shuffleGroup property
    groupBy(
      columns.filter(c => c.shuffleGroup !== undefined),
      'shuffleGroup'
    )
  ).map(
    // Extract column names
    g => g.map(c => c.name)
  )

const processItems = items =>
  items.rows
    .map(r => r[0])
    .filter(i => i.label !== '')
    .map(i => {
      // Provide a default name based on the label
      // for the items that require one
      if (['text', 'divider'].includes(i.type)) {
        return i
      } else {
        return ({
          ...i,
          name: i.name || slugify(i.label || '')
        })
      }
    })

// Process any single node in isolation
const processNode = node => {
  // Options to exclude from JSON output
  const filteredOptions = ['skipCondition']

  // TODO: This filters empty string values, which are
  // created by empty form fields in the builder. This is
  // hackish, and may not work indefinately -- it might
  // have to be solved on the input side, or by making
  // the library more resilient to malformed input.
  // Either way, this is probably not the final solution.
  const filterOptions = (value, key) =>
    value !== '' &&
    !(key.startsWith('_') || filteredOptions.includes(key))

  return Object.assign({}, pickBy(node, filterOptions), {
    files: node.files
      ? processFiles(node.files)
      : {},
    messageHandlers: node.messageHandlers
      ? processMessageHandlers(node.messageHandlers)
      : node.messageHandlers,
    parameters: node.parameters
      ? processParameters(node.parameters)
      : {},
    items: node.items
      ? processItems(node.items)
      : null,
    responses: node.responses
      ? processResponses(node.responses)
      : {},
    skip: node.skip || node.skipCondition || undefined,
    templateParameters: node.templateParameters
      ? processTemplateParameters(node.templateParameters)
      : node.templateParameters,
    shuffleGroups: node.templateParameters
      ? processShuffleGroups(node.templateParameters.columns || [])
      : node.shuffleGroups,
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
          break
        case 'lab.flow.Loop':
          // A loop has a single template
          if (!isEmpty(currentNode.children)) {
            output.template = makeComponentTree(data, currentNode.children[0])
          }
          break
        case 'lab.canvas.Frame':
        case 'lab.html.Frame':
          // A loop has a single template
          if (!isEmpty(currentNode.children)) {
            output.content = makeComponentTree(data, currentNode.children[0])
          }
          break
        default:
          // TODO: This won't catch canvas-based
          // components, but it also doesn't need
          // to right now.
          break
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

const makeStudyScript = studyTreeJSON =>
`// Define study
const study = lab.util.fromObject(${ studyTreeJSON })

// Let's go!
study.run()`

export const makeScript = (state) => {
  // Process study tree
  const componentTree = makeComponentTree(state.components, 'root')
  const studyTreeJSON = serialize(componentTree, { space: 2 })
  return makeStudyScript(studyTreeJSON)
}
