/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Utilities', () => {
  describe('Random', () => {

    let rng_alea,
      rng_random

    beforeEach(() => {
      rng_alea = new lab.util.Random({
        algorithm: 'alea',
        seed: 'abcd'
      })

      rng_random = new lab.util.Random()
    })

    it('provides random floating point numbers', () => {
      assert.closeTo(
        rng_alea.random(),
        0.7154429776128381,
        Math.pow(10, -16)
      )

      assert.closeTo(
        rng_alea.random(),
        0.8120661831926554,
        Math.pow(10, -16)
      )

      assert.typeOf(
        rng_random.random(),
        'number'
      )
    })

    it('provides integers up to a given maximum', () => {
      assert.deepEqual(
        [1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10)),
        [7, 8, 8, 4, 2, 2, 9]
      )

      assert.typeOf(
        rng_random.range(10),
        'number'
      )

      assert.ok(
        0 <=rng_random.range(10) && rng_random.range(10) < 10
      )
    })

    it('provides integers in a given range', () => {
      assert.deepEqual(
        [1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10, 20)),
        [7, 8, 8, 4, 2, 2, 9].map(x => x + 10) // shifted from above
      )

      assert.typeOf(
        rng_random.range(10, 20),
        'number'
      )

      assert.ok(
        10 <=rng_random.range(10, 20) && rng_random.range(10, 20) < 20
      )
    })

    it('provides individual random samples from an array', () => {
      const array = [1, 2, 3]
      assert.deepEqual(
        [1, 2, 3, 4].map(() => rng_alea.choice(array)),
        [3, 3, 3, 2]
      )

      assert.ok(
        array.includes(rng_random.choice(array))
      )
    })

    it('provides multiple random samples, without replacement', () => {
      const array = [1, 2, 3, 4, 5]

      assert.deepEqual(
        rng_alea.sample(array, 4),
        [2, 1, 3, 5]
      )
    })

    it('limits samples w/o replacement to the original array length', () => {
      const array = [1, 2, 3, 4, 5]

      assert.equal(
        rng_alea.sample(array, 6).length,
        array.length
      )
    })

    it('provides multiple random samples, with replacement', () => {
      const array = [1, 2, 3, 4, 5]

      assert.deepEqual(
        rng_alea.sample(array, 4, true),
        [4, 5, 5, 3]
      )
    })

    it('supports sequential mode', () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'sequential'),
        [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2]
      )
    })

    it('supports draw-then-repeat sample mode', () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'draw'),
        [2, 1, 3, 5, 4, 3, 1, 5, 4, 2, 2, 3]
      )
    })

    it('supports draw-then-repeat-then-shuffle mode', () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'draw-shuffle'),
        [3, 1, 3, 5, 3, 2, 2, 5, 1, 4, 4, 2]
      )
    })

    it('defers sampling with replacement to sample method', () => {
      const array = [1, 2, 3, 4, 5]
      const spy = sinon.spy(rng_alea, 'sample')

      rng_alea.sampleMode(array, 12, 'draw-replace'),

      assert.ok(spy.calledOnce)
      assert.ok(spy.calledWith(array, 12, true))
    })

    it('does not subsample if no number of samples is provided', () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.sampleMode(array, undefined, 'draw'),
        [2, 1, 3, 5, 4]
      )
    })

    it('throws an error if asked to sample from an empty array', () => {
      assert.throws(
        () => rng_alea.sampleMode([]),
        "Can't sample: Empty input, or not an array"
      )
    })

    it('throws an error if the sample mode is unknown', () => {
      assert.throws(
        () => rng_alea.sampleMode([1, 2, 3], 2, 'unknown'),
        'Unknown sample mode, please specify'
      )
    })

    it('shuffles an array', () => {
      const array = [1, 2, 3, 4, 5]
      assert.deepEqual(
        rng_alea.shuffle(array),
        [2, 1, 3, 5, 4]
      )

      assert.ok(
        rng_random
          .shuffle(array)
          .every(x => array.includes(x))
      )
    })

    it('does not modify the array while shuffling it', () => {
      const array = [1, 2, 3, 4, 5]
      rng_alea.shuffle(array)
      assert.deepEqual(
        array,
        [1, 2, 3, 4, 5]
      )
    })

    it('shuffles while checking a constraint function', () => {
      const array = [1, 2, 3]
      const constraint = (a) => a[0] === 1 && a[1] === 2 && a[2] === 3

      assert.deepEqual(
        rng_alea.constrainedShuffle(array, constraint),
        [1, 2, 3]
      )
    })

    it('constrained shuffle stops after a given number of iterations', () => {
      const array = [1, 2, 3]

      // Shim constraint that always fails
      const constraint = sinon.stub()
      constraint.returns(false)

      const result = rng_alea.constrainedShuffle(array, constraint, {}, 10)

      // Check constraint calls
      assert.equal(
        constraint.callCount,
        10
      )
      // Result is still shuffled
      assert.deepEqual(
        result,
        [1, 3, 2]
      )
    })

    it('shuffles with minimum distance constraint', () => {
      const array = [1, 2, 2]
      assert.deepEqual(
        rng_alea.constrainedShuffle(array, { minRepDistance: 2 }),
        [2, 1, 2]
      )
    })

    it('can apply a hash function before calculating distances', () => {
      const array = [{ value: 1 }, { value: 2 }, { value: 2 }]
      assert.deepEqual(
        rng_alea.constrainedShuffle(array,
          { minRepDistance: 2 },
          { hash: x => x.value },
        ),
        [{ value: 2 }, { value: 1 }, { value: 2 }]
      )
    })

    it('shuffles with maximum run length constraint', () => {
      const array = ['a', 'a', 'b', 'b']
      assert.deepEqual(
        rng_alea.constrainedShuffle(array, { maxRepSeries: 1 }),
        ['b', 'a', 'b', 'a']
      )
    })

    it('can apply a custom equality function for evaluating run length', () => {
      const array = [1, '1', 2, '2']
      assert.deepEqual(
        rng_alea.constrainedShuffle(array,
          { maxRepSeries: 1 },
          // Allow for type coercion when testing equality
          { equality: (x, y) => x == y },
        ),
        ['2', '1', 2, 1]
      )
    })

    it('can apply a custom equality func that checks nested keys', () => {
      const array = [{ foo: 1 }, { foo: '1' }, { foo: 2 }, { foo: '2' }]

      assert.deepEqual(
        rng_alea.constrainedShuffle(array,
          { maxRepSeries: 1 },
          { equality: (a, b) => a.foo == b.foo }
        ),
        [{ foo: '2' }, { foo: '1' }, { foo: 2 }, { foo: 1 }]
      )
    })

    it('can raise an exception if the iteration limit is broken', () => {
      assert.throws(
        () => rng_alea.constrainedShuffle(
          [1, 2, 3],
          () => false, // Always fail check
          {},  // No further helpers
          5,   // Five iterations
          true // Fail when the maximum number of iterations is reached
        ),
        'constrainedShuffle could not find a matching candidate ' +
        'after 5 iterations'
      )
    })

    it('shuffles groups of keys in a table independently', () => {
      const table = [
        { a: 1,  b: 2,  c: 3,  d: 4,  e: 5  },
        { a: 6,  b: 7,  c: 8,  d: 9,  e: 10 },
        { a: 11, b: 12, c: 13, d: 14, e: 15 },
      ]
      const output = [
        { a: 1,  b: 2,  c: 13, d: 9,  e: 10 },
        { a: 6,  b: 7,  c: 3,  d: 4,  e: 5  },
        { a: 11, b: 12, c: 8,  d: 14, e: 15 },
      ]

      assert.deepEqual(
        rng_alea.shuffleTable(
          table,
          [['a', 'b'], ['c']]
        ),
        output
      )
    })

    it('doesn\'t shuffle ungrouped columns if requested', () => {
      const table = [
        { a: 1,  b: 2,  c: 3,  d: 4,  e: 5  },
        { a: 6,  b: 7,  c: 8,  d: 9,  e: 10 },
        { a: 11, b: 12, c: 13, d: 14, e: 15 },
      ]
      const output = [
        { a: 1,  b: 2,  c: 13, d: 4,  e: 5 },
        { a: 6,  b: 7,  c: 3,  d: 9,  e: 10 },
        { a: 11, b: 12, c: 8,  d: 14, e: 15 },
      ]

      assert.deepEqual(
        rng_alea.shuffleTable(
          table,
          [['a', 'b'], ['c']],
          false
        ),
        output
      )
    })

    it('generates a random v4 uuid', () => {
      assert.equal(
        rng_alea.uuid4(),
        'bcd644f6-0ee1-4006-bb7b-70dfdcef7c41'
      )
      assert.match(
        rng_random.uuid4(),
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[8-9a-b][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    })

  })

  describe('fromObject', () => {

    // The fromObject utility function (currently) assumes that the library
    // is available as a global variable. This is not the case with karma-based
    // testing, so the following code injects the local variable into the
    // global namespace if necessary.
    let libraryInjected = false

    beforeEach(() => {
      if (!window.lab) {
        libraryInjected = true
        window.lab = lab
      }

      // Construct a minimal plugin in the global scope
      window.MyPlugin = function MyPlugin() {
        this.handle = function() {}
      }
    })

    afterEach(() => {
      if (libraryInjected) {
        delete window.lab
      }

      // Remove plugin
      delete window.MyPlugin
    })

    it('creates a lab.js component from a base object', () => {
      const c = lab.util.fromObject({
        type: 'lab.core.Component'
      })

      assert.instanceOf(c, lab.core.Component)
    })

    it('transfers options to new object', () => {
      const c = lab.util.fromObject({
        type: 'lab.core.Dummy',
        option: 'value',
      })

      assert.instanceOf(c, lab.core.Dummy)
      assert.equal(c.options.option, 'value')
    })

    it('parses nested components as array', () => {
      const s = lab.util.fromObject({
        type: 'lab.flow.Sequence',
        content: [
          {
            type: 'lab.core.Dummy',
            option: 'value'
          }
        ]
      })

      assert.instanceOf(s.options.content[0], lab.core.Dummy)
      assert.equal(s.options.content[0].options.option, 'value')
    })

    it('parses individual nested components', () => {
      const f = lab.util.fromObject({
        type: 'lab.html.Frame',
        content: {
          type: 'lab.core.Dummy',
          option: 'value'
        }
      })

      assert.instanceOf(f.options.content, lab.core.Dummy)
      assert.equal(f.options.content.options.option, 'value')
    })

    it('parses plugins', () => {
      const pluginArgs = {
        type: 'lab.plugins.Debug',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.plugins.plugins[0] instanceof lab.plugins.Debug
      )
    })

    it('parses plugins from global scope', () => {
      const pluginArgs = {
        type: 'global.MyPlugin',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    it('loads plugins via the path option', () => {
      const pluginArgs = {
        type: 'global.UnavailablePlugin',
        path: 'global.MyPlugin',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    it('throws error if plugin is not available', () => {
      assert.throws(
        () => lab.util.fromObject({
          type: 'lab.core.Component',
          plugins: [{ path: 'global.UnavailablePlugin' }]
        })
      )
    })
  })

  describe('Geometry', () => {
    const tolerance = Math.pow(10, -5)

    it('converts degrees to radians', () => {
      assert.equal(
        lab.util.geometry.toRadians(0),
        0,
      )

      assert.equal(
        lab.util.geometry.toRadians(180),
        Math.PI,
      )

      // And so on ...
    })

    it('calculates individual vertices of a convex polygon', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 0)

      assert.closeTo(vertex[0], 0, tolerance)
      assert.closeTo(vertex[1], 100, tolerance)
    })

    it('generates more than one vertex', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 1)

      assert.closeTo(vertex[0], 100, tolerance)
      assert.closeTo(vertex[1], 0, tolerance)
    })

    it('shifts the polygon center', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 2, [0, 100])

      assert.closeTo(vertex[0], 0, tolerance)
      assert.closeTo(vertex[1], 0, tolerance)
    })

    it('rotates the polygon if so instructed', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 1, [0, 0], 90)

      assert.closeTo(vertex[0], 0, tolerance)
      assert.closeTo(vertex[1], -100, tolerance)
    })

    it('can generate the complete set of vertices for a polygon', () => {
      const vertices = lab.util.geometry.polygon(8, 100)

      assert.closeTo(vertices[0][0],   0, tolerance)
      assert.closeTo(vertices[0][1], 100, tolerance)

      assert.closeTo(vertices[1][0], 100*Math.sqrt(2)/2, tolerance)
      assert.closeTo(vertices[1][1], 100*Math.sqrt(2)/2, tolerance)

      assert.closeTo(vertices[2][0], 100, tolerance)
      assert.closeTo(vertices[2][1],   0, tolerance)

      // To be continued ...
    })
  })

  describe('Tree traversal', () => {

    let s, a, b, c, d
    beforeEach(() => {
      a = new lab.core.Component()
      b = new lab.core.Component()
      d = new lab.core.Component()
      c = new lab.html.Frame({
        context: '<main></main>',
        contextSelector: 'main',
        content: d,
      })

      s = new lab.flow.Sequence({
        content: [a, b, c]
      })
    })

    it('traverses nested structure of components', () => {
      const spy = sinon.spy()

      lab.util.tree.traverse(s, spy)

      assert.ok(spy.getCalls().length === 5)
      assert.ok(spy.getCall(0).calledWith(s))
      assert.ok(spy.getCall(1).calledWith(a))
      assert.ok(spy.getCall(2).calledWith(b))
      assert.ok(spy.getCall(3).calledWith(c))
      assert.ok(spy.getCall(4).calledWith(d))
    })

    it('reduces a tree to a specific value', () => {
      s.options.multiplier = 3
      a.options.multiplier = 4
      b.options.multiplier = 5
      c.options.multiplier = 6
      d.options.multiplier = 7

      const spy = sinon.spy((acc, c) => acc * c.options.multiplier)

      assert.equal(
        lab.util.tree.reduce(s, spy, 1),
        2520
      )
    })
  })

  describe('Statistics', () => {
    it('calculates the sum of an array', () => {
      assert.equal(
        lab.util.stats.sum([1, 2, 3]),
        6
      )
    })

    it('calculates the mean of an array', () => {
      assert.equal(
        lab.util.stats.mean([1, 2, 3]),
        2
      )
    })

    it('calculates the variance of an array', () => {
      assert.equal(
        lab.util.stats.variance([1, 2, 3]),
        2/3
      )
    })

    it('calculates the standard deviation of an array', () => {
      assert.equal(
        lab.util.stats.std([1, 2, 3]),
        Math.sqrt(2/3)
      )
    })
  })

  describe('Combinatorics', () => {
    it('produces set products', () => {
      // Is a generator
      const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor
      assert.instanceOf(
        lab.util.combinatorics.product,
        GeneratorFunction
      )

      // Behaves correctly
      assert.deepEqual(
        Array.from(lab.util.combinatorics.product([1, 2, 3], ['a', 'b', 'c'])),
        [
          [1, 'a'],
          [1, 'b'],
          [1, 'c'],
          [2, 'a'],
          [2, 'b'],
          [2, 'c'],
          [3, 'a'],
          [3, 'b'],
          [3, 'c'],
        ]
      )

      assert.deepEqual(
        Array.from(lab.util.combinatorics.product(
          ['A', 'B'], [1, 2, 3, 4], ['a', 'b']
        )),
        [
          ["A", 1, "a"],
          ["A", 1, "b"],
          ["A", 2, "a"],
          ["A", 2, "b"],
          ["A", 3, "a"],
          ["A", 3, "b"],
          ["A", 4, "a"],
          ["A", 4, "b"],
          ["B", 1, "a"],
          ["B", 1, "b"],
          ["B", 2, "a"],
          ["B", 2, "b"],
          ["B", 3, "a"],
          ["B", 3, "b"],
          ["B", 4, "a"],
          ["B", 4, "b"]
        ]
      )
    })

    it('cartesian product accounts for empty sets', () => {
      assert.deepEqual(
        Array.from(lab.util.combinatorics.product(
          ['A', 'B'], [], ['a', 'b']
        )),
        [
          ['A', undefined, 'a'],
          ['A', undefined, 'b'],
          ['B', undefined, 'a'],
          ['B', undefined, 'b']
        ]
      )
    })
  })
})

})
