import { Component, Controller, Dummy } from '../core'
import { Loop } from './loop'

import { assignIn } from 'lodash'

const makeController = (root: Component) => {
  return new Controller({ root, el: document.body })
}

it('clones template to create content', async () => {
  const t = new Component({
    parameters: {
      constantParameter: 'original',
      customParameter: 'original',
    },
  })
  const l = new Loop({
    template: t,
    templateParameters: [
      { customParameter: 'one' },
      { customParameter: 'two' },
      { customParameter: 'three' },
    ],
  })

  // Initialize shim experiment
  await makeController(l).run()

  expect(
    l.options.content.every(
      c =>
        c.options.parameters.constantParameter ===
        t.options.parameters.constantParameter,
    ),
  ).toBeTruthy()

  const expectedValues = ['one', 'two', 'three']
  expect(
    l.options.content.every(
      (c, i) => c.options.parameters.customParameter === expectedValues[i],
    ),
  ).toBeTruthy()
})

it('clones template array to create content', async () => {
  const t = [
    new Component({
      parameters: {
        constantParameter: 'original_one',
        customParameter: 'original',
      },
    }),
    new Component({
      parameters: {
        constantParameter: 'original_two',
        customParameter: 'original',
      },
    }),
  ]
  const l = new Loop({
    template: t,
    templateParameters: [
      { customParameter: 'one' },
      { customParameter: 'two' },
      { customParameter: 'three' },
    ],
  })

  await makeController(l).run()

  expect(
    l.options.content.every(
      (c, i) =>
        c.options.parameters.constantParameter ===
        t[i % 2].options.parameters.constantParameter,
    ),
  ).toBeTruthy()

  const expectedValues = ['one', 'two', 'three']
  expect(
    l.options.content.every(
      (c, i) =>
        c.options.parameters.customParameter ===
        expectedValues[Math.floor(i / 2)],
    ),
  ).toBeTruthy()
})

it('uses a template function to generate content', async () => {
  const l = new Loop({
    template: p =>
      new Component({
        parameters: assignIn({ constantParameter: 'constant' }, p),
      }),
    templateParameters: [
      { customParameter: 'one' },
      { customParameter: 'two' },
      { customParameter: 'three' },
    ],
  })

  await makeController(l).run()

  expect(
    l.options.content.every(
      c => c.options.parameters.constantParameter === 'constant',
    ),
  ).toBeTruthy()

  const expectedValues = ['one', 'two', 'three']
  expect(
    l.options.content.every(
      (c, i) => c.options.parameters.customParameter === expectedValues[i],
    ),
  ).toBeTruthy()
})

it('issues warning if templateParameters are empty or invalid', async () => {
  const spy = jest //
    .spyOn(console, 'warn')
    .mockImplementationOnce(msg => null)

  const l = new Loop({
    template: new Dummy(),
    templateParameters: undefined,
  })

  await makeController(l).run()

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    'Empty or invalid parameter set for loop, no content generated',
  )

  spy.mockRestore()
})

it('issues warning if no template, or an invalid one, is provided', async () => {
  const spy = jest //
    .spyOn(console, 'warn')
    .mockImplementationOnce(msg => null)

  const l = new Loop({
    template: undefined,
    templateParameters: [{ one: 1 }],
  })

  await makeController(l).run()

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    'Missing or invalid template in loop, no content generated',
  )

  spy.mockRestore()
})

// Helper function
const extractParameters = <T>(l: Loop<T>) =>
  l.options.content.map(component => {
    //@ts-ignore
    const { a, b, c } = component.parameters
    return { a, b, c }
  })

const exampleParameters = [
  { a: 1, b: 1, c: 1 },
  { a: 2, b: 2, c: 2 },
  { a: 3, b: 3, c: 3 },
  { a: 4, b: 4, c: 4 },
]

it('shuffles parameter table if requested', async () => {
  const l = new Loop({
    // Seed PRNG for reproducibility
    random: {
      algorithm: 'alea',
      seed: 'abcd',
    },
    shuffleGroups: [['a', 'b'], ['c']],
    template: new Component(),
    templateParameters: exampleParameters,
  })

  await makeController(l).run()

  expect(extractParameters(l)).toEqual([
    { a: 1, b: 1, c: 3 },
    { a: 2, b: 2, c: 4 },
    { a: 4, b: 4, c: 1 },
    { a: 3, b: 3, c: 2 },
  ])
})

it("doesn't shuffle unnamed parameters by default", async () => {
  const l = new Loop({
    // Seed PRNG for reproducibility
    random: {
      algorithm: 'alea',
      seed: 'abcd',
    },
    shuffleGroups: [['a', 'b']],
    template: new Component(),
    templateParameters: exampleParameters,
  })

  await makeController(l).run()

  expect(extractParameters(l)).toEqual([
    { a: 1, b: 1, c: 1 },
    { a: 2, b: 2, c: 2 },
    { a: 4, b: 4, c: 3 },
    { a: 3, b: 3, c: 4 },
  ])
})

it('shuffles unnamed parameters if told to', async () => {
  const l = new Loop({
    // Seed PRNG for reproducibility
    random: {
      algorithm: 'alea',
      seed: 'abcd',
    },
    shuffleGroups: [['a'], ['c']],
    shuffleUngrouped: true,
    template: new Component(),
    templateParameters: exampleParameters,
  })

  await makeController(l).run()

  expect(extractParameters(l)) //
    .toEqual([
      { a: 1, b: 4, c: 3 },
      { a: 2, b: 2, c: 4 },
      { a: 4, b: 3, c: 1 },
      { a: 3, b: 1, c: 2 },
    ])
})

it("doesn't choke when parameters are empty", async () => {
  // Catch the warning that is thrown
  const spy = jest //
    .spyOn(console, 'warn')
    .mockImplementationOnce(msg => null)

  const l = new Loop({
    template: new Component(),
  })

  await makeController(l).run()

  expect(spy).toHaveBeenCalledTimes(1)
  spy.mockRestore()
})

it('subsamples content if so instructed', async () => {
  const l = new Loop({
    // Seed PRNG for reproducibility
    random: {
      algorithm: 'alea',
      seed: 'abcd',
    },
    sample: {
      n: 3,
      mode: 'draw-shuffle',
    },
    template: new Component(),
    templateParameters: [
      { customParameter: 'one' },
      { customParameter: 'two' },
      { customParameter: 'three' },
      { customParameter: 'four' },
    ],
  })

  await makeController(l).run()

  expect(
    l.options.content.map(c => c.options.parameters.customParameter),
  ).toEqual(['one', 'two', 'four'])
})

it('parses template parameter content', async () => {
  const l = new Loop({
    parameters: {
      one: '1',
      two: '2',
    },
    template: new Component(),
    templateParameters: [
      { customParameter: '${ this.parameters.one }' },
      { customParameter: '${ this.parameters.two }' },
    ],
  })

  await makeController(l).run()

  expect(l.options.content[0].parameters.customParameter) //
    .toEqual('1')
  expect(l.options.content[1].parameters.customParameter) //
    .toEqual('2')
})
