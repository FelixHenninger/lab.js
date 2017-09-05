const toRadians = degrees => Math.PI * (degrees / 180)

const renderElement = (ctx, content) => {
  console.log('rendering something')
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

export default content => (ts, canvas, ctx) =>
  (content || []).forEach(c => renderElement(ctx, c))
