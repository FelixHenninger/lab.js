import UAParser from 'ua-parser-js'

// Detect user agent --------------------------------------
export const browserName: string | undefined = new UAParser().getBrowser().name
export const browserVersion: number = parseInt(
  new UAParser().getBrowser().version?.split('.')?.[0] ?? 'NaN',
  10,
)
