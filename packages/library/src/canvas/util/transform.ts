type CanvasTransformationOptions = {
  translateOrigin?: boolean
  viewportScale?: number | 'auto'
  devicePixelScaling?: boolean
  canvasClientRect?: {
    left: number
    top: number
  }
  fromOffset?: boolean
}

type CanvasTransformation = {
  translateX: number
  translateY: number
  scale: number
  viewportScale: number
  pixelRatio: number
}

const calcTransformationParameters = (
  canvasSize: [number, number],
  viewportSize: [number, number],
  opt: CanvasTransformationOptions = {},
): CanvasTransformation => {
  const options = {
    translateOrigin: true,
    viewportScale: 'auto',
    devicePixelScaling: true,
    canvasClientRect: {
      left: 0,
      top: 0,
    },
    ...opt,
  }

  // Translate coordinate system origin
  // to the center of the canvas
  const translateX = options.translateOrigin ? canvasSize[0] / 2 : 0

  const translateY = options.translateOrigin ? canvasSize[1] / 2 : 0

  // Scale coordinate system to match device scaling
  const pixelRatio = options.devicePixelScaling ? window.devicePixelRatio : 1

  // Scale viewport to fill one dimension (if requested)
  // The calculation needs to adjust for the fact that the
  // width and height of the canvas may represent virtual
  // coordinates on a latent high-resolution canvas
  const viewportScale =
    options.viewportScale === 'auto'
      ? Math.min(
          canvasSize[0] / (pixelRatio * viewportSize[0]),
          canvasSize[1] / (pixelRatio * viewportSize[1]),
        )
      : (options.viewportScale as number)

  // The total canvas scaling factor is determined
  // by the translation of viewport pixels to canvas
  // pixels, and then onto hardware pixels
  const scale = viewportScale * pixelRatio

  return {
    translateX,
    translateY,
    scale,
    viewportScale,
    pixelRatio,
  }
}

export const makeTransform = (
  canvasSize: [number, number],
  viewportSize: [number, number],
  opt: CanvasTransformationOptions,
) => {
  const { translateX, translateY, scale } = calcTransformationParameters(
    canvasSize,
    viewportSize,
    opt,
  )

  // Translate from the canvas coordinate system to device pixels
  // prettier-ignore
  return [
    scale, 0,
    0, scale,
    translateX, translateY,
  ]
}

export const makeInverseTransform = (
  canvasSize: [number, number],
  viewportSize: [number, number],
  opt: CanvasTransformationOptions,
) => {
  // Requires either the fromOffset flag or a directly specified offset
  if (!opt.fromOffset && !opt.canvasClientRect) {
    throw 'Transformation requires either an offset or the fromOffset option'
  }

  const { translateX, translateY, scale, viewportScale } =
    calcTransformationParameters(canvasSize, viewportSize, opt)

  // Optionally add (or ignore) offset created by
  // the position of the canvas on the page
  // TODO: Rethink option naming
  const { left: offsetLeft, top: offsetTop } =
    opt.fromOffset === true ? { left: 0, top: 0 } : opt.canvasClientRect!

  // Translate from viewport coordinates to the canvas coordinate system
  // prettier-ignore
  return [
    1 / viewportScale, 0,
    0, 1 / viewportScale,
    (-translateX / scale) - (offsetLeft / viewportScale),
    (-translateY / scale) - (offsetTop  / viewportScale),
  ]
}

export const transform = (matrix: number[], [x, y]: [number, number]) =>
  // Hard-coded matrix multiplication for a 2x3
  // transformation matrix and a 2d coordinate vector
  [
    x * matrix[0] + y * matrix[2] + matrix[4],
    x * matrix[1] + y * matrix[3] + matrix[5],
  ]
