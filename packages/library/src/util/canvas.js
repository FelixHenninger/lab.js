import { fromPairs } from 'lodash'
import { toRadians } from './geometry'

// Utilities -------------------------------------------------------------------

const calcTransformationParameters = (canvasSize, viewportSize, opt={}) => {
  const options = {
    translateOrigin: true,
    viewportScale: 'auto',
    devicePixelScaling: true,
    canvasClientRect: {
      left: 0, top: 0,
    },
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
  // The calculation needs to adjust for the fact that the
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

  // The total canvas scaling factor is determined
  // by the translation of viewport pixels to canvas
  // pixels, and then onto hardware pixels
  const scale = viewportScale * pixelRatio

  return {
    translateX, translateY,
    scale, viewportScale,
    pixelRatio,
  }
}

export const makeTransform = (canvasSize, viewportSize, opt) => {
  const { translateX, translateY, scale } =
    calcTransformationParameters(canvasSize, viewportSize, opt)

  // Translate from the canvas coordinate system
  // to device pixels
  return [
    scale, 0,
    0, scale,
    translateX, translateY,
  ]
}

export const makeInverseTransform = (canvasSize, viewportSize, opt) => {
  const { translateX, translateY, scale, viewportScale } =
    calcTransformationParameters(canvasSize, viewportSize, opt)

  // Optionally add (or ignore) offset created by
  // the position of the canvas on the page
  // TODO: Rethink option naming
  const { left: offsetLeft, top: offsetTop } = opt.fromOffset === true
    ? { left: 0, top: 0 }
    : opt.canvasClientRect

  // Translate from viewport coordinates
  // to the canvas coordinate system
  return [
    1 / viewportScale, 0,
    0, 1 / viewportScale,
    (-translateX / scale) - (offsetLeft / viewportScale),
    (-translateY / scale) - (offsetTop  / viewportScale),
  ]
}

export const transform = (matrix, [x, y]) =>
  // Hard-coded matrix multiplication for a 2x3
  // transformation matrix and a 2d coordinate vector
  [
    (x * matrix[0]) + (y * matrix[2]) + matrix[4],
    (x * matrix[1]) + (y * matrix[3]) + matrix[5],
  ]

// Generic render function -----------------------------------------------------

const renderElement = (ctx, content, cache={}) => {
  ctx.save()

  // Clear existing paths
  ctx.beginPath()

  // Move to position and rotate context
  ctx.translate(content.left, content.top)
  ctx.rotate(toRadians(content.angle))

  // Type-specific drawing
  switch (content.type) {
    case 'line':
      ctx.moveTo(-content.width / 2, 0)
      ctx.lineTo(+content.width / 2, 0)
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
        content.width / 2,
        0, toRadians(360),
      )
      break
    case 'ellipse':
      ctx.ellipse(
        0, 0, content.width / 2, content.height / 2,
        0, 0, toRadians(360),
      )
      break
    case 'text':
    case 'i-text':
      ctx.font = `${ content.fontStyle || 'normal' } ` +
        `${ content.fontWeight || 'normal' } ` +
        `${ content.fontSize || 32 }px ` +
        `${ content.fontFamily || 'sans-serif' }`
      ctx.textAlign = content.textAlign || 'center'
      // TODO: Make this configurable
      ctx.textBaseline = 'middle'

      break
    case 'image':
      // Load image element from cache
      const img = cache.images[content.src]

      // Recalculate width and height
      // to preserve aspect ratio, if requested
      const width = content.autoScale === 'width'
        ? img.naturalWidth * (content.height / img.naturalHeight)
        : content.width
      const height = content.autoScale === 'height'
        ? img.naturalHeight * (content.width / img.naturalWidth)
        : content.height

      ctx.drawImage(img,
        -width / 2, -height / 2,
        width, height,
      )

      break
    default:
      throw new Error('Unknown content type')
  }

  // Fill and stroke
  if (content.fill) {
    ctx.fillStyle = content.fill
    if (content.type !== 'i-text' && content.type !== 'text') {
      ctx.fill()
    } else {
      // TODO: This wants to be abstracted out,
      // along with the analogous stroke function below.
      content.text
        .split('\n')
        .forEach((lineContent, i, lines) => {
          ctx.fillText(
            lineContent, 0,
            (i - ((lines.length - 1) * 0.5)) *
              (content.fontSize || 32) *
              (content.lineHeight || 1.16),
          )
        })
    }
  }

  if (content.stroke && content.strokeWidth) {
    ctx.strokeStyle = content.stroke
    ctx.lineWidth = content.strokeWidth || 1
    if (content.type !== 'i-text' && content.type !== 'text') {
      ctx.stroke()
    } else {
      content.text
        .split('\n')
        .forEach((lineContent, i, lines) => {
          ctx.strokeText(
            lineContent, 0,
            (i - ((lines.length - 1) * 0.5)) *
              (content.fontSize || 32) *
              (content.lineHeight || 1.16),
          )
        })
    }
  }

  ctx.restore()
}

export const makeRenderFunction = (content, cache) => (ts, canvas, ctx) =>
  (content || []).forEach(c => renderElement(ctx, c, cache))

// Path handling ---------------------------------------------------------------

// Load a matrix transformation class:
// DOMMatrix if available, SVGMatrix otherwise
const MatrixReadOnly = window.DOMMatrixReadOnly !== undefined
  ? new window.DOMMatrixReadOnly()
  : document
      .createElementNS("http://www.w3.org/2000/svg", "svg")
      .createSVGMatrix()

export const makePath = (ctx, content) => {
  const rawPath = new Path2D()

  // Type-specific path extensions
  switch (content.type) {
    case 'aoi':
      rawPath.rect(
        -content.width / 2, -content.height / 2,
        content.width, content.height,
      )
      break
    default:
      console.error('Content type not yet implemented')
      // TODO: cover remaining object types
  }

  // Create a copy of the path that has been translated into place
  const translatedPath = new Path2D()
  translatedPath.addPath(
    rawPath,
    MatrixReadOnly
      .translate(content.left, content.top)
      .rotate(content.angle) // (in degrees, for a change)
  )
  return translatedPath
}

export const makePathFunction = (content) => (ts, canvas, ctx) =>
  fromPairs(
    content
      .filter(c => ['aoi'].includes(c.type)) // Currently supported content
      .map(c => [c.label, makePath(ctx, c)]) // Key / path pairs
  )
