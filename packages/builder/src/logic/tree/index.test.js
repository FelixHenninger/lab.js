import { children, parents } from './index'

const testingState = {
  root: {
    children: ['A', 'B', 'C', 'D']
  },
  A: {
    children: ['A1', 'A2', 'A3']
  },
  A1: {},
  A2: {},
  A3: {},
  B: {
    children: ['B1', 'B2']
  },
  B1: {},
  B2: {},
  C: {
    children: ['C1']
  },
  C1: {
    children: ['C1x', 'C1y', 'C1z']
  },
  C1x: {},
  C1y: {},
  C1z: {},
  D: {
    children: []
  },
}

it('extracts child ids from a node', () => {
  expect(
    children('A1', testingState)
  ).toEqual([])

  expect(
    children('C', testingState)
  ).toEqual(['C1', 'C1x', 'C1y', 'C1z'])

  expect(
    children('D', testingState)
  ).toEqual([])
})

it('computes parents of a node', () => {
  expect(
    parents('root', testingState)
  ).toEqual([])

  expect(
    parents('A', testingState)
  ).toEqual(['root'])

  expect(
    parents('C1x', testingState).sort()
  ).toEqual(['C1', 'C', 'root'].sort())
})
