import { fabric } from 'fabric'

export default (gridSize, offsetX, offsetY) => {
  // Correct for high-DPI devices
  const size = gridSize / window.devicePixelRatio
  // FIXME: Non-integer values break things

  // Create a single tile
  const backgroundTile = new fabric.StaticCanvas()
  backgroundTile.setDimensions({
    width: size, height: size,
  })

  // The grid needs to be filled in all four corners,
  // for one pixel each
  Array(4).fill().forEach((_, i) => {
    const [x, y] = [i % 2 * size, Math.floor(i / 2) * size]
    backgroundTile.add(new fabric.Rect({
      width: 1, height: 1,
      // FIXME: This is a hack, and it breaks down
      // when adding window scaling
      left: x - 1 + (offsetX / window.devicePixelRatio),
      top: y - 1 + (offsetY / window.devicePixelRatio),
      fill: 'rgba(0, 0, 0, 0.125)',
    }))
  })

  return backgroundTile
}
