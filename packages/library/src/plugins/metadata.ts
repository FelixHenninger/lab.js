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

const extractURLSearchParams = (search: string) =>
  fromPairs(
    Array.from(
      //@ts-ignore TS doesn't recognize the entries method
      new URLSearchParams(search).entries(),
    ),
  )

import { Plugin } from '../base/plugin'
import { Component } from '../base/component'

type MetadataPluginOptions = {
  location_search?: string
}

export default class Metadata implements Plugin {
  options: MetadataPluginOptions

  constructor(options: MetadataPluginOptions = {}) {
    this.options = options
  }

  async handle(context: Component, event: string) {
    if (event === 'prepare') {
      // Extract URL parameters from location string
      const urlParams = extractURLSearchParams(
        // Allow injection of search string for testing
        this.options.location_search ?? window.location.search,
      )

      // If a datastore is available, save the metadata there ...
      context.options.datastore.set({
        url: urlParams,
        meta: getMetadata(),
      })
    }
  }
}
