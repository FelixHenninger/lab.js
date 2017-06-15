
export default class Metadata {
  handle(context, event) {
    switch (event) {
      case 'prepare':
        return this.onPrepare(context)
      default:
        return null
    }
  }

  onPrepare(context) {
    const intl = window.Intl.DateTimeFormat().resolvedOptions()

    context.data.meta = {
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
    }
  }
}
