import { toRadians, polygonVertex, polygon } from './geometry'

it('converts degrees to radians', () => {
  expect(toRadians(0)).toBe(0)
  expect(toRadians(180)).toBe(Math.PI)

  // And so on ...
})

it('calculates individual vertices of a convex polygon', () => {
  const vertex = polygonVertex(4, 100, 0)

  expect(vertex[0]).toBeCloseTo(0, 5)
  expect(vertex[1]).toBeCloseTo(100, 5)
})

it('generates more than one vertex', () => {
  const vertex = polygonVertex(4, 100, 1)

  expect(vertex[0]).toBeCloseTo(100, 5)
  expect(vertex[1]).toBeCloseTo(0, 5)
})

it('shifts the polygon center', () => {
  const vertex = polygonVertex(4, 100, 2, [0, 100])

  expect(vertex[0]).toBeCloseTo(0, 5)
  expect(vertex[1]).toBeCloseTo(0, 5)
})

it('rotates the polygon if so instructed', () => {
  const vertex = polygonVertex(4, 100, 1, [0, 0], 90)

  expect(vertex[0]).toBeCloseTo(0, 5)
  expect(vertex[1]).toBeCloseTo(-100, 5)
})

it('can generate the complete set of vertices for a polygon', () => {
  const vertices = polygon(8, 100)

  expect(vertices[0][0]).toBeCloseTo(0, 5)
  expect(vertices[0][1]).toBeCloseTo(100, 5)

  expect(vertices[1][0]).toBeCloseTo((100 * Math.sqrt(2)) / 2, 5)
  expect(vertices[1][1]).toBeCloseTo((100 * Math.sqrt(2)) / 2, 5)

  expect(vertices[2][0]).toBeCloseTo(100, 5)
  expect(vertices[2][1]).toBeCloseTo(0, 5)

  // To be continued ...
})
