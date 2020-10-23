// This is a very basic shim to use rIC on browsers
// that have it, and use the simplest possible
// alternative on all others. The setTimeOut shim is
// not ideal for a variety of reasons, including
// performance, but any alternatives would be very heavy.

declare global {
  interface Window {
    requestIdleCallback(): void
  }
}

export const requestIdleCallback = window.requestIdleCallback
  ? window.requestIdleCallback
  : (fn: () => void) => window.setTimeout(fn)
