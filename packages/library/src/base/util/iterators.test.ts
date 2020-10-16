import { TreeIterable } from './iterators'

test('Extracts slices from study tree', () => {
  const a1 = { name: 'a1', done: false, status: 0, internals: {} }
  const a2 = { name: 'a2', done: false, status: 0, internals: {} }
  const root = {
    name: 'root',
    done: false,
    status: 0,
    internals: {
      iterator: [a1, a2].entries(),
    },
  }

  //@ts-ignore We're faking components here
  const tree = new TreeIterable(root)
  const stacks = Array.from(tree)

  expect(stacks).toEqual([
    [root, a1],
    [root, a2],
  ])
})
