import { mimeFromDataURI } from './dataURI'

export const mimeToIcon = (mime='') => {
  const [family, ] = mime.split('/')

  const mimeFamilies = [
    'image', 'audio', 'video'
  ]
  const codeMimes = [
    'text/html', 'text/css',
    'application/javascript', 'application-json'
  ]

  if (mimeFamilies.includes(family)) {
    return 'file-' + family
  } else if (codeMimes.includes(mime)) {
    return 'file-code'
  } else if (mime === 'text/plain') {
    return 'file-alt'
  } else {
    return 'file'
  }
}

export const dataURItoIcon = uri =>
  mimeToIcon(mimeFromDataURI(uri))
