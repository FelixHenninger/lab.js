export const requestAnimationFrameMaybe = function (
  requestFrame: boolean,
  timestamp: number,
  handler: (timestamp: number) => void,
) {
  if (requestFrame) {
    return window.requestAnimationFrame(handler)
  } else {
    handler(timestamp)
    return undefined
  }
}
