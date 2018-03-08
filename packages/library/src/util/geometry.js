import { range } from 'lodash'

export const toRadians = degrees => Math.PI * (degrees / 180)

// Calculate coordinates for a single vertex on a convex polygon
export const polygonVertex = (edges, radius, n=0, center=[0, 0], angle=0) => {
  // Calculate angle from the vertical axis
  const a = toRadians(n * 360/edges + angle)

  return [
    radius * Math.sin(a) + center[0], // x
    radius * Math.cos(a) + center[1], // y
  ]
}

// Compute array of vertex coordinates for a convex polygon
export const polygon = (edges, radius, center=[0, 0], angle=0) =>
  range(edges)
    .map(i => polygonVertex(edges, radius, i, center, angle))
