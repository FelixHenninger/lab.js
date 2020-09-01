import UAParser from 'ua-parser-js'

// Detect user agent --------------------------------------
export const browserName = new UAParser().getBrowser().name
export const browserVersion = parseInt(
  new UAParser().getBrowser().version.split('.')[0], 10
)
