// Wrappers for inconsistent fullscreen APIs

export const launch = (el: HTMLElement) => {
  if (el.requestFullscreen) {
    return el.requestFullscreen()
  } else if ('webkitRequestFullscreen' in el) {
    // @ts-expect-error TS is being too optimistic about browser support here
    return el.webkitRequestFullscreen()
  }
}

export const exit = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  } else if ('webkitExitFullscreen' in document) {
    // @ts-expect-error - Again, we can't ignore this possibility
    return document.webkitExitFullscreen()
  }
}
