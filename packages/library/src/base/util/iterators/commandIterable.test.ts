import { CommandIterable } from './commandIterable'

const makeStubComponent = (name: string) => ({
  name,
  done: false,
  // FIXME I'm circumventing a check here that also
  // requires the hack below
  status: 2,
  internals: {},
  prepare: () => null,
})

const makeStubTree = () => {
  const a1 = makeStubComponent('a1')
  const a2 = makeStubComponent('a2')
  const root = {
    ...makeStubComponent('root'),
    internals: {
      iterator: [a1, a2].entries(),
    },
  }

  return { a1, a2, root }
}

test('Extracts slices from study tree', async () => {
  const { a1, a2, root } = makeStubTree()

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const stacks = Array.from(tree)

  expect(stacks).toEqual([
    // Missing b/c the shim I'm using here is very bad (see above)
    //['run', root, false],
    ['run', a1, true],
    ['end', a1, true],
    ['run', a2, true],
    ['end', a2, true],
    ['end', root, false],
  ])
})

test('Can abort a leaf component', () => {
  const { a1, a2, root } = makeStubTree()
  const b1 = makeStubComponent('b1')
  const b2 = makeStubComponent('b2')

  a1.internals = {
    iterator: [b1, b2].entries(),
  }

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const iterator = tree[Symbol.iterator]()

  // Skipping ['run', root, false], see above
  expect(iterator.next().value).toEqual(['run', a1, false])
  expect(iterator.next().value).toEqual(['run', b1, true])
  //@ts-ignore Again, working with shims here
  tree.abort(a1)
  expect(iterator.next().value).toEqual(['end', b1, true])
  // Important: Skipping b2 here
  expect(iterator.next().value).toEqual(['end', a1, false])
  expect(iterator.next().value).toEqual(['run', a2, true])
})
