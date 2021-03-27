import {promises as fs} from 'fs'
import path from 'path'
import {zip} from 'lodash'
import mime from 'mime'

import plainGlob from 'glob'
import { promisify } from 'util'
const glob = promisify(plainGlob)

// Helper functions ------------------------------------------------------------

// Given a path p, return either the path (if it resolves to a file),
// or an array of all nested  paths (if it resolves to a directory)
const nestedPaths = async p =>
  (await fs.lstat(p)).isDirectory()
    ? await glob('**/*', { cwd: p, absolute: true, nodir: true })
    : p

const commonPrefix = (arr) => {
  // Create a sorted copy of the array
  const s = [...arr].sort()

  // Extract the first and last entries
  const first = arr[0]
  const last = arr.pop()

  // Move along the first entry until it differs from the last,
  // and return the common stem.
  for (let i = 0; i < first.length; i++) {
    if (first[i] !== last[i]) {
      return first.slice(0, i)
    }
  }

  // If there was no difference along the entire length,
  // return (a copy of) the entire string.
  return first.slice()
}

// Given a set of paths, find the lowest common prefix
// (this is inspired heavily by the rosetta code solution at
// https://www.rosettacode.org/wiki/Find_common_directory_path#JavaScript
// I think there are still some more optimizations available, for example
// it should be possible to sort the paths and look only at the first and
// last. For now, this remains a TODO)
const commonPathPrefix = (paths, sep=path.sep) => {
  const transposedPaths = zip(...paths.map(p => p.split(sep)))
  const commonSegments = transposedPaths.filter(
    segmentGroup => segmentGroup.every((s, _, a) => s === a[0])
  ).map(g => g[0])
  return commonSegments.join(sep)
}

// Load a file as a dataURI
const toDataURI = async (p) => {
  const base64 = (await fs.readFile(p)).toString('base64')
  const mimetype = mime.getType(path.extname(p).slice(1))
  return `data:${mimetype};base64,${base64}`
}

// File import -----------------------------------------------------------------

export const getFiles = async (paths) => {
  console.log('paths in getfiles: ', paths)
  // Check for file sizes

  // Recursively load all files in nested subdirectories
  const fullPaths = (await Promise.all(paths.map(nestedPaths))).flat()

  // Compute the common path prefix. If there's only a single file,
  // we assume that it's at the top level.
  const prefix = fullPaths.length > 1
    ? commonPathPrefix(fullPaths)
    : path.dirname(fullPaths[0])

  // Prune paths
  const prunedPaths = fullPaths.map(p => path.relative(prefix, p))

  // Check for the presence of an index.html file
  if (!prunedPaths.includes('index.html')) {
    console.log('No index.html in file set')
    // TODO: Raise error
  }

  // Return common prefix, as well as a map of paths to data URIs
  return [
    prefix,
    Object.fromEntries(
      await Promise.all(
        fullPaths.map(async (p, i) => [prunedPaths[i], await toDataURI(p)])
      )
    )
  ]
}
