import { fabric } from 'fabric'

export default (width, height, viewPort) => {
  const overlay = new fabric.StaticCanvas()
  overlay.setDimensions({
    width: width + 20, height: height + 20,
  })

  // Transform coordinate system
  overlay.setViewportTransform([
    1, 0, 0, 1,
    width/2 + 10, height/2 + 10
  ])

  // Draw viewport margin ------------------------------------------------------
  const vp = new fabric.Path(
    `M ${ -width/2 - 10 } ${ -height/2 - 10 } ` +
    `L ${ -width/2 - 10 } ${ +height/2 + 10 } ` +
    `L ${ +width/2 + 10 } ${ +height/2 + 10 } ` +
    `L ${ +width/2 + 10 } ${ -height/2 - 10 } ` +
    `L ${ -width/2 - 10 } ${ -height/2 - 10 } z ` +
    // Lines are offset here to make them sharp
    `M ${ -viewPort[0]/2 - 0.5 } ${ -viewPort[1]/2 - 0.5 } ` +
    `L ${ +viewPort[0]/2 - 0.5 } ${ -viewPort[1]/2 - 0.5 } ` +
    `L ${ +viewPort[0]/2 - 0.5 } ${ +viewPort[1]/2 - 0.5 } ` +
    `L ${ -viewPort[0]/2 - 0.5 } ${ +viewPort[1]/2 - 0.5 } ` +
    `L ${ -viewPort[0]/2 - 0.5 } ${ -viewPort[1]/2 - 0.5 } z`
  )

  vp.setOptions({ fill: 'rgba(255, 255, 255, 0.6)' })
  overlay.add(vp)

  // Draw viewPort border ------------------------------------------------------
  overlay.add(new fabric.Rect({
    width: viewPort[0] + 1,
    height: viewPort[1] + 1,
    left: -viewPort[0]/2 - 1,
    top: -viewPort[1]/2 - 1,
    fill: 'transparent',
    stroke: 'rgba(0, 0, 0, 0.125)',
  }))

  return overlay
}
