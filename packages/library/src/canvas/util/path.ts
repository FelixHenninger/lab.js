import { fromPairs } from 'lodash'
import { CanvasContent, AOI } from './render'

// Path handling ---------------------------------------------------------------

// Load a matrix transformation class
const MatrixReadOnly = new window.DOMMatrixReadOnly()

export const makePath = (
  ctx: CanvasRenderingContext2D,
  content: CanvasContent,
) => {
  const rawPath = new Path2D()

  // Type-specific path extensions
  switch (content.type) {
    case 'aoi':
      rawPath.rect(
        -content.width / 2,
        -content.height / 2,
        content.width,
        content.height,
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
    MatrixReadOnly.translate(content.left, content.top) //
      .rotate(content.angle), // (in degrees, for a change)
  )
  return translatedPath
}

export const makePathFunction =
  (content: AOI[] = []) =>
  (ts: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) =>
    fromPairs(
      content
        .filter(c => c.label && ['aoi'].includes(c.type)) // Supported objects
        .map(c => [c.label, makePath(ctx, c)]), // Make key / path pairs
    )
