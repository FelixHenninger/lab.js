// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/ua-parser-js` if it exists... Remove this comment to see the full error message
import UAParser from 'ua-parser-js'

// Detect user agent --------------------------------------
export const browserName = new UAParser().getBrowser().name
export const browserVersion = parseInt(
  new UAParser().getBrowser().version.split('.')[0], 10
)
