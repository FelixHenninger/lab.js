
import { fromPairs } from 'lodash'
import { version, build } from '../index'

const getMetadata = () => {
  const intl = window.Intl.DateTimeFormat().resolvedOptions()

  return {
    // TODO: Use optional chaining when available
    labjs_version: version,
    labjs_build: build,
    location: window.location.href,
    userAgent: window.navigator.userAgent,
    platform: window.navigator.platform,
    language: window.navigator.language,
    locale: intl.locale,
    timeZone: intl.timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    scroll_width: document.body.scrollWidth,
    scroll_height: document.body.scrollHeight,
    window_innerWidth: window.innerWidth,
    window_innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  }
}

const extractURLSearchParams = (search: any) =>
  fromPairs(
    
    Array.from(
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'entries' does not exist on type 'URLSear... Remove this comment to see the full error message
      new URLSearchParams(search).entries(),
    ),
  )

export default class Metadata {
  options: any

  constructor(options = {}) {
    this.options = options
  }

  handle(context: any, event: any) {
    if (event === 'prepare') {
      // Extract URL parameters from location string
      const urlParams = extractURLSearchParams(
        // Allow injection of search string for testing
        this.options.location_search || window.location.search,
      )

      // If a datastore is available, save the metadata there ...
      context.options.datastore.set({
        url: urlParams,
        meta: getMetadata(),
      })
    }
  }
}
