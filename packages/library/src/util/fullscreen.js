// Wrappers for inconsistent fullscreen APIs

export const launch = (el) => {
  if (el.requestFullscreen) {
    return el.requestFullscreen()
  } else if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen()
  } else if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen()
  } else if (el.msRequestFullscreen) {
    return el.msRequestFullscreen()
  }
}

export const exit = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen()
  } else if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen()
  }
}
