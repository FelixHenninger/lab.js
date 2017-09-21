// Utilities -------------------------------------------------------------------

const toRadians = degrees => Math.PI * (degrees / 180)

export const makeTransformationMatrix = (canvasSize, viewportSize, opt={}) => {
  const options = {
    translateOrigin: true,
    viewportScale: 'auto',
    devicePixelScaling: true,
    ...opt,
  }

  // Translate coordinate system origin
  // to the center of the canvas
  const translateX = options.translateOrigin
    ? canvasSize[0] / 2
    : 0

  const translateY = options.translateOrigin
    ? canvasSize[1] / 2
    : 0

  // Scale coordinate system to match device scaling
  const pixelRatio = options.devicePixelScaling
    ? window.devicePixelRatio
    : 1

  // Scale viewport to fill one dimension (if requested)
  // The calculation needs to ajust for the fact that the
  // width and height of the canvas may represent virtual
  // coordinates on a latent high-resolution canvas
  /* eslint-disable indent */
  const viewportScale = options.viewportScale === 'auto'
    ? Math.min(
        canvasSize[0] / (pixelRatio * viewportSize[0]),
        canvasSize[1] / (pixelRatio * viewportSize[1]),
      )
    : options.viewportScale
  /* eslint-enable indent */

  const scale = viewportScale * pixelRatio

  // Export transformation matrix
  return [
    scale, 0,
    0, scale,
    translateX, translateY,
  ]
}

// Generic render function -----------------------------------------------------

const renderElement = (ctx, content) => {
  ctx.save()

  // Clear existing paths
  ctx.beginPath()

  // Move to position and rotate context
  ctx.translate(content.left, content.top)
  ctx.rotate(toRadians(content.angle))

  // Type-specific drawing
  switch (content.type) {
    case 'line':
      ctx.moveTo(0, 0)
      ctx.lineTo(content.width, 0)
      break
    case 'rect':
      ctx.rect(
        -content.width / 2, -content.height / 2,
        content.width, content.height,
      )
      break
    case 'triangle':
      /* eslint-disable space-in-parens, no-multi-spaces */
      ctx.moveTo(-content.width / 2,  content.height / 2)
      ctx.lineTo(                 0, -content.height / 2)
      ctx.lineTo( content.width / 2,  content.height / 2)
      /* eslint-enable space-in-parens, no-multi-spaces */
      ctx.closePath()
      break
    case 'circle':
      ctx.arc(
        0, 0,
        content.radius,
        0, toRadians(360),
      )
      break
    case 'ellipse':
      ctx.ellipse(
        0, 0, content.rx, content.ry,
        0, 0, toRadians(360)
      )
      break
    case 'i-text':
      ctx.font = `${ content.fontStyle } ${ content.fontWeight } ` +
        `${ content.fontSize }px ${ content.fontFamily }`
      ctx.textAlign = content.textAlign
      // TODO: Make this configurable
      ctx.textBaseline = 'middle'

      break
    default:
      throw new Error('Unknown content type')
  }

  // Fill and stroke
  if (content.fill) {
    ctx.fillStyle = content.fill
    if (content.type !== 'i-text') {
      ctx.fill()
    } else {
      ctx.fillText(content.text, 0, 0)
    }
  }

  if (content.stroke) {
    ctx.strokeStyle = content.stroke
    ctx.lineWidth = content.strokeWidth || 1
    if (content.type !== 'i-text') {
      ctx.stroke()
    } else {
      ctx.strokeText(content.text, 0, 0)
    }
  }

  ctx.restore()
}

export const genericRenderFunction = content => (ts, canvas, ctx) =>
  (content || []).forEach(c => renderElement(ctx, c))
