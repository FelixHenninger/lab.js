import { fabric } from 'fabric'

export default (gridSize, offsetX, offsetY) => {
  // Create a single tile
  const backgroundTile = new fabric.StaticCanvas()
  backgroundTile.setDimensions({
    width: gridSize, height: gridSize,
  })

  // The grid needs to be filled in all four corners,
  // for one pixel each
  Array(4).fill().forEach((_, i) => {
    const [x, y] = [i % 2 * gridSize, Math.floor(i / 2) * gridSize]
    backgroundTile.add(new fabric.Rect({
      width: 1, height: 1,
      left: x - 1 + offsetX,
      top: y - 1 + offsetY,
      fill: 'rgba(0, 0, 0, 0.125)',
    }))
  })

  return backgroundTile
}
