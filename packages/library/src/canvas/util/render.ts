/* eslint-disable no-case-declarations */

import { toRadians } from '../../util/geometry'

// Generic render function -----------------------------------------------------

const renderElement = (
  ctx: CanvasRenderingContext2D,
  content: CanvasContent,
  cache: any = {},
) => {
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
      // prettier-ignore
      ctx.rect(
        -content.width / 2, -content.height / 2,
        content.width, content.height,
      )
      break
    case 'triangle':
      // prettier-ignore
      ctx.moveTo(-content.width / 2,  content.height / 2)
      // prettier-ignore
      ctx.lineTo(                 0, -content.height / 2)
      // prettier-ignore
      ctx.lineTo( content.width / 2,  content.height / 2)
      ctx.closePath()
      break
    case 'circle':
      // prettier-ignore
      ctx.arc(
        0, 0, content.width / 2,
        0, toRadians(360),
      )
      break
    case 'ellipse':
      // prettier-ignore
      ctx.ellipse(
        0, 0, content.width / 2, content.height / 2,
        0, 0, toRadians(360),
      )
      break
    case 'text':
    case 'i-text':
      ctx.font =
        `${content.fontStyle || 'normal'} ` +
        `${content.fontWeight || 'normal'} ` +
        `${content.fontSize || 32}px ` +
        `${content.fontFamily || 'sans-serif'}`
      ctx.textAlign = content.textAlign || 'center'
      // TODO: Make this configurable
      ctx.textBaseline = 'middle'

      break
    case 'image':
      // Load image element from cache
      const [img, bitmap] = cache.images.readSync(content.src)

      // Recalculate width and height
      // to preserve aspect ratio, if requested
      const width =
        content.autoScale === 'width'
          ? img.naturalWidth * (content.height / img.naturalHeight)
          : content.width
      const height =
        content.autoScale === 'height'
          ? img.naturalHeight * (content.width / img.naturalWidth)
          : content.height

      // prettier-ignore
      ctx.drawImage(bitmap || img,
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
      content.text.split('\n').forEach((lineContent, i, lines) => {
        ctx.fillText(
          lineContent,
          0,
          (i - (lines.length - 1) * 0.5) *
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
      content.text.split('\n').forEach((lineContent, i, lines) => {
        ctx.strokeText(
          lineContent,
          0,
          (i - (lines.length - 1) * 0.5) *
            (content.fontSize || 32) *
            (content.lineHeight || 1.16),
        )
      })
    }
  }

  ctx.restore()
}

export const makeRenderFunction =
  (content: CanvasContent[] = [], cache: any) =>
  (_: number, canvas: HTMLCanvasElement, ctx: RenderingContext) => {
    // Ensure that the context is of the 2d type
    const context =
      ctx instanceof CanvasRenderingContext2D ? ctx : canvas.getContext('2d')
    if (!context) throw new Error(`Couldn't access 2d rendering context`)

    // Render content
    content.forEach(c => renderElement(context, c, cache))
  }

// Types -----------------------------------------------------------------------

type BaseContent = {
  left: number
  top: number
  angle: number
  width: number
  height: number
}

type VisibleContent = BaseContent & {
  fill?: string
  stroke?: string
  strokeWidth?: number
}

type Line = VisibleContent & {
  type: 'line'
}

type Rect = VisibleContent & {
  type: 'rect'
}

type Triangle = VisibleContent & {
  type: 'triangle'
}

type Circle = VisibleContent & {
  type: 'circle'
}

type Ellipse = VisibleContent & {
  type: 'ellipse'
}

type Text = VisibleContent & {
  type: 'i-text' | 'text' // TODO deprecate one of these
  text: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  fontFamily?: string
  lineHeight?: number
  textAlign?: CanvasTextAlign
}

export type Image = VisibleContent & {
  type: 'image'
  src: string
  autoScale: 'width' | 'height' | 'none'
}

export type AOI = BaseContent & {
  type: 'aoi'
  label: string
}

export type CanvasContent =
  | Line
  | Rect
  | Triangle
  | Circle
  | Ellipse
  | Text
  | Image
  | AOI
