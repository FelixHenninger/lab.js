// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/lodash` if it exists or ad... Remove this comment to see the full error message
import { range } from 'lodash'

// @ts-expect-error ts-migrate(7031) FIXME: Binding element 'x1' implicitly has an 'any' type.
export const distance = ([x1, y1], [x2, y2]) =>
  Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)

export const toRadians = (degrees: any) => Math.PI * (degrees / 180)

// Calculate coordinates for a single vertex on a convex polygon
export const polygonVertex = (edges: any, radius: any, n=0, center=[0, 0], angle=0) => {
  // Calculate angle from the vertical axis
  const a = toRadians(n * (360 / edges) + angle)

  return [
    radius * Math.sin(a) + center[0], // x
    radius * Math.cos(a) + center[1], // y
  ]
}

// Compute array of vertex coordinates for a convex polygon
export const polygon = (edges: any, radius: any, center=[0, 0], angle=0) =>
  range(edges)
    .map((i: any) => polygonVertex(edges, radius, i, center, angle))
