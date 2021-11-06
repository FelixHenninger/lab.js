import { CommandIterable } from './commandIterable'

const makeStubComponent = (name: string, id?: string) => ({
  name,
  id,
  done: false,
  // FIXME I'm circumventing a check here that also
  // requires the hack below
  status: 2,
  internals: {},
  prepare: () => null,
})

const makeStubTree = () => {
  const a1 = makeStubComponent('a1', '0')
  const a2 = makeStubComponent('a2', '1')
  const root = {
    ...makeStubComponent('root', '0'),
    internals: {
      iterator: [a1, a2].entries(),
    },
  }

  return { a1, a2, root }
}

const makeDeepTree = () => {
  const { a1, a2, root } = makeStubTree()

  // Nested tree beneath a1
  const b1 = makeStubComponent('b1', '0')
  const b2 = makeStubComponent('b2', '1')
  a1.internals = {
    iterator: [b1, b2].entries(),
  }

  const c1 = makeStubComponent('c1', '0')
  const c2 = makeStubComponent('c2', '1')
  a2.internals = {
    iterator: [c1, c2].entries(),
  }

  return { root, a1, a2, b1, b2, c1, c2 }
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

test('Can jump stacks', () => {
  const { root, a1, a2, b1, c2 } = makeDeepTree()

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const iterator = tree[Symbol.iterator]()

  // Skipping ['run', root, false], see above
  expect(iterator.next().value).toEqual(['run', a1, false])
  expect(iterator.next().value).toEqual(['run', b1, true])
  //@ts-ignore Again, working with shims here
  tree.targetStack = [root, a2, c2]
  expect(iterator.next().value).toEqual(['end', b1, true])
  // Important: Skipping b2 here
  expect(iterator.next().value).toEqual(['end', a1, false])
  expect(iterator.next().value).toEqual(['run', a2, false])
  // Important: Skipping c1 here
  expect(iterator.next().value).toEqual(['run', c2, true])
  expect(iterator.next().value).toEqual(['end', c2, true])
  // Note that this doesn't test that the a2 iterator is updated,
  // so the next drawn component drawn would be wrong
})

test('Can fast-forward through tree', () => {
  const { root, a1, a2, b1, c2 } = makeDeepTree()

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const iterator = tree[Symbol.iterator]()

  expect(iterator.next().value).toEqual(['run', a1, false])
  expect(iterator.next().value).toEqual(['run', b1, true])

  // Fast-forward
  tree.fastForward(['1', '1'])
  expect(tree.targetStack).toEqual([root, a2, c2])

  // Complete transition and remaining iteration run
  expect(iterator.next().value).toEqual(['end', b1, true])
  expect(iterator.next().value).toEqual(['end', a1, false])
  expect(iterator.next().value).toEqual(['run', a2, false])
  expect(iterator.next().value).toEqual(['run', c2, true])
  expect(iterator.next().value).toEqual(['end', c2, true])
  expect(iterator.next().value).toEqual(['end', a2, false])
  expect(iterator.next().value).toEqual(['end', root, false])
})

test('Can fast-forward through a subtree', () => {
  // In the test above, we're skipping all levels of the tree
  // (except the root node, which is constant). We need to make
  // sure that skipping works also if only a subtree is skipped
  const { root, a1, b1, b2 } = makeDeepTree()

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const iterator = tree[Symbol.iterator]()

  expect(iterator.next().value).toEqual(['run', a1, false])
  expect(iterator.next().value).toEqual(['run', b1, true])

  tree.fastForward(['0', '1'])
  expect(tree.targetStack).toEqual([root, a1, b2])
  expect(iterator.next().value).toEqual(['end', b1, true])
  expect(iterator.next().value).toEqual(['run', b2, true])
})

test('Stops if an id is not met', () => {
  const { root, a1, a2, b1, c1 } = makeDeepTree()

  //@ts-ignore We're faking components here
  const tree = new CommandIterable(root)
  const iterator = tree[Symbol.iterator]()

  expect(iterator.next().value).toEqual(['run', a1, false])
  expect(iterator.next().value).toEqual(['run', b1, true])

  // Fast-forward to an id that doesn't exist
  // (remember that we keep the root level, so id 0 refers to a1)
  tree.fastForward(['0', 'foo'])
  expect(tree.targetStack).toEqual([root, a1])

  // Complete transition and remaining iteration run
  expect(iterator.next().value).toEqual(['end', b1, true])
  // Skip b2
  expect(iterator.next().value).toEqual(['end', a1, false])
  expect(iterator.next().value).toEqual(['run', a2, false])
  expect(iterator.next().value).toEqual(['run', c1, true])
  expect(iterator.next().value).toEqual(['end', c1, true])
  // ... continue from here
})
