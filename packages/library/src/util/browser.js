import UAParser from 'ua-parser-js'

// Detect user agent --------------------------------------
export const browserName = new UAParser().getBrowser().name
