// Global canvas functions used in all of the following components
// (multiple inheritance would come in handy here, but alas...)

export const setupCanvas = function setupCanvas(
  canvas: HTMLCanvasElement,
  { devicePixelScaling = true },
) {
  // Calculate scaling factor necessary for full resolution rendering
  const pixelRatio = devicePixelScaling ? window.devicePixelRatio : 1

  // Calculate available space, accounting for padding around the canvas
  const wrapper = canvas.parentElement!
  const wrapperStyle = window.getComputedStyle(wrapper)

  // TODO: The call to getComputedStyle above, as well as and the width
  // and height calculations here, cause layout reflow. Think about
  // providing an option to disable this (the user would then have to
  // fix the canvas width and height manually via CSS)
  const width =
    wrapper.clientWidth -
    parseInt(wrapperStyle.paddingLeft) -
    parseInt(wrapperStyle.paddingRight)
  const height =
    wrapper.clientHeight -
    parseInt(wrapperStyle.paddingTop) -
    parseInt(wrapperStyle.paddingBottom)

  // Adjust the (internal) canvas dimensions
  // to match the physical screen pixels
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio

  // Display as block so that dimensions apply exactly
  canvas.style.display = 'block'

  // Set the canvas element dimensions to match the available space
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
}
