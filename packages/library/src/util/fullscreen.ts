// Wrappers for inconsistent fullscreen APIs

export const launch = (el: any) => {
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  } if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen();
  } if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  } if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }
};

export const exit = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mozCancelFullScreen' does not exist on t... Remove this comment to see the full error message
  } if (document.mozCancelFullScreen) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mozCancelFullScreen' does not exist on t... Remove this comment to see the full error message
    return document.mozCancelFullScreen()
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'webkitExitFullscreen' does not exist on ... Remove this comment to see the full error message
  } if (document.webkitExitFullscreen) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'webkitExitFullscreen' does not exist on ... Remove this comment to see the full error message
    return document.webkitExitFullscreen()
  }
}
