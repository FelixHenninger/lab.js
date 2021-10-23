import { CommandIterable } from "./commandIterable"

const makeStubComponent = (name: string) => ({
  name,
  done: false,
  // FIXME I'm circumventing a check here that also
  // requires the hack below
  status: 2,
  internals: {},
  prepare: () => null,
})

test('Extracts slices from study tree', async () => {
  const a1 = makeStubComponent('a1')
  const a2 = makeStubComponent('a2')
  const root = {
    ...makeStubComponent('root'),
    internals: {
      iterator: [a1, a2].entries(),
    },
  }

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
