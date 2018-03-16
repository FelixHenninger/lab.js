const getMetadata = () => {
  const intl = window.Intl.DateTimeFormat().resolvedOptions()

  return {
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

export default class Metadata {
  // TODO: The linter thinks it is not worth to use
  // a class here. Possibly the plugin could accept
  // additional data to include?
  // eslint-disable-next-line class-methods-use-this
  handle(context, event) {
    if (event === 'prepare') {
      // If a datastore is available, save the metadata
      // directly, otherwise treat it just like any other
      // data, and rely on custom / manual storage
      if (context.options.datastore) {
        context.options.datastore.set(
          'meta', getMetadata(),
        )
      } else {
        // This assignment is intentional
        // eslint-disable-next-line no-param-reassign
        context.data.meta = getMetadata()
      }
    }
  }
}
