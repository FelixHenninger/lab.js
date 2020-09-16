import { readDataURI } from '../../util/dataURI'
import { template } from 'lodash'

// Render HTML from a list of objects
// (TODO: I'm not sure if this isn't too convoluted.
// We might switch back to string-based node element
// generation at some later point)
const renderNode = ([type, attrs={}]) => {
  if (type === 'comment') {
    return `<!-- ${ attrs.content } -->`
  } else {
    const node = document.createElement(type)
    Object.entries(attrs)
      .forEach(([attr, value]) => node.setAttribute(attr, value))
    return node.outerHTML
  }
}

const makeHeader = (state, { beforeHeader=[], libraryPath='lib', dev=false }={}) => {
  const defaultHeader = [
    ['comment', { content: 'lab.js library code' }],
    ['script', {
      'src': `${ libraryPath }/${ dev ? 'lab.dev.js' : 'lab.js' }`,
      'data-labjs-script': 'library'
    }],
    ['script', {
      'src': `${ libraryPath }/lab.fallback.js`,
      'data-labjs-script': 'fallback'
    }],
    ['link', { rel: 'stylesheet', href: `${ libraryPath }/lab.css` }],
    ['comment', { content: 'study code and styles' }],
    ['script', { src: 'script.js', defer: true }],
    ['link', { rel: 'stylesheet', href: 'style.css' }],
  ]

  // TBC ...
  return [...beforeHeader, ...defaultHeader]
    .map(renderNode)
    .map((l, i) => i === 0 ? l : `  ${ l }`) // Indent from second line
    .join('\n')
}

export const makeHTML = (state, headerOptions) => {
  const { data } = readDataURI(state.files.files['index.html'].content)

  const updatedHTML = template(data, {
    escape: '',
    evaluate: '',
  })({
    header: makeHeader(state, headerOptions)
  })

  return updatedHTML
}
