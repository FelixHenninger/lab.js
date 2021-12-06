import { range } from 'lodash'

export const distance = (
  [x1, y1]: [number, number],
  [x2, y2]: [number, number],
) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

export const toRadians = (degrees: number) => Math.PI * (degrees / 180)

// Calculate coordinates for a single vertex on a convex polygon
export const polygonVertex = (
  edges: number,
  radius: number,
  n = 0,
  center = [0, 0],
  angle = 0,
) => {
  // Calculate angle from the vertical axis
  const a = toRadians(n * (360 / edges) + angle)

  return [
    radius * Math.sin(a) + center[0], // x
    radius * Math.cos(a) + center[1], // y
  ]
}

// Compute array of vertex coordinates for a convex polygon
export const polygon = (
  edges: number,
  radius: number,
  center = [0, 0],
  angle = 0,
) => range(edges).map(i => polygonVertex(edges, radius, i, center, angle))
