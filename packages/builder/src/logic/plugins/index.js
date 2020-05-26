import { fromPairs, mapValues, template, uniqBy } from 'lodash'

import { loadPlugin } from './library'

// File management
// Plugin files are placed in `lib/plugins/${ pluginName }`.
// This code moves plugin files and updates the paths accordingly.
const pluginDir = 'lib/plugins'

// Prepend plugin path to filenames
const prependPath = (files={}, pluginName) =>
  fromPairs(
    Object.entries(files).map(([path, data]) => [
      `${ pluginDir }/${ pluginName }/${ path }`,
      data,
    ])
  )

// Add plugin path to header attributes
const parseHeaders = (headers=[], pluginName) =>
  headers.map(([tag, attributes]) => [
    tag,
    mapValues(attributes, a =>
      typeof a === 'string'
        ? template(a)({ pluginPath: `${ pluginDir }/${ pluginName }` })
        : a
    ),
  ])

export const embedPlugins = state => {
  // Collect plugins used in components
  const plugins = Object.entries(state.components)
    .map(([_, c]) => c.plugins || [])
    .reduce((prev, a) => prev.concat(a), [])

  // Remove duplicate plugins
  const uniquePlugins = uniqBy(plugins, p => p.type)

  // Load plugins, ignoring unknown ones
  // (plugins are represented in the following by [type, data] tuples)
  const loadedPlugins = uniquePlugins
    .map(data => [data.type, loadPlugin(data.type)])
    .filter(([, data]) => data !== undefined)

  // Move files and update page headers
  const pluginFiles = loadedPlugins
    .map(([type, data]) => prependPath(data.files, type))
    .reduce((prev, o) => Object.assign(prev, o), {})

  const pluginHeaders = loadedPlugins
    .map(([type, data]) => parseHeaders(data.headers, type))
    .reduce((prev, a) => prev.concat(a), [])

  // Collect plugin load path information
  const pluginPaths = fromPairs(
    loadedPlugins
      .map(([type, data]) => [type, data.path])
      .filter(([, path]) => path !== undefined)
  )

  return {
    pluginFiles,
    pluginHeaders,
    pluginPaths,
  }
}
