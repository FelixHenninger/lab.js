/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Utilities', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Random', () => {

    let rng_alea: any,
      rng_random: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      rng_alea = new lab.util.Random({
        algorithm: 'alea',
        seed: 'abcd'
      })

      rng_random = new lab.util.Random()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides random floating point numbers', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(
        rng_alea.random(),
        0.7154429776128381,
        Math.pow(10, -16)
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(
        rng_alea.random(),
        0.8120661831926554,
        Math.pow(10, -16)
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.typeOf(
        rng_random.random(),
        'number'
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides integers up to a given maximum', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        [1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10)),
        [7, 8, 8, 4, 2, 2, 9]
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.typeOf(
        rng_random.range(10),
        'number'
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        0 <=rng_random.range(10) && rng_random.range(10) < 10
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides integers in a given range', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        [1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10, 20)),
        [7, 8, 8, 4, 2, 2, 9].map(x => x + 10) // shifted from above
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.typeOf(
        rng_random.range(10, 20),
        'number'
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        10 <=rng_random.range(10, 20) && rng_random.range(10, 20) < 20
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides individual random samples from an array', () => {
      const array = [1, 2, 3]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        [1, 2, 3, 4].map(() => rng_alea.choice(array)),
        [3, 3, 3, 2]
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'number... Remove this comment to see the full error message
        array.includes(rng_random.choice(array))
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides multiple random samples, without replacement', () => {
      const array = [1, 2, 3, 4, 5]

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sample(array, 4),
        [2, 1, 3, 5]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('limits samples w/o replacement to the original array length', () => {
      const array = [1, 2, 3, 4, 5]

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        rng_alea.sample(array, 6).length,
        array.length
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides multiple random samples, with replacement', () => {
      const array = [1, 2, 3, 4, 5]

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sample(array, 4, true),
        [4, 5, 5, 3]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports sequential mode', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'sequential'),
        [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports draw-then-repeat sample mode', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'draw'),
        [2, 1, 3, 5, 4, 3, 1, 5, 4, 2, 2, 3]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports draw-then-repeat-then-shuffle mode', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sampleMode(array, 12, 'draw-shuffle'),
        [3, 1, 3, 5, 3, 2, 2, 5, 1, 4, 4, 2]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('defers sampling with replacement to sample method', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(rng_alea, 'sample')

      rng_alea.sampleMode(array, 12, 'draw-replace'),

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.calledOnce)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.calledWith(array, 12, true))
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not subsample if no number of samples is provided', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.sampleMode(array, undefined, 'draw'),
        [2, 1, 3, 5, 4]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws an error if asked to sample from an empty array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.throws(
        () => rng_alea.sampleMode([]),
        "Can't sample: Empty input, or not an array"
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws an error if the sample mode is unknown', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.throws(
        () => rng_alea.sampleMode([1, 2, 3], 2, 'unknown'),
        'Unknown sample mode, please specify'
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles an array', () => {
      const array = [1, 2, 3, 4, 5]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.shuffle(array),
        [2, 1, 3, 5, 4]
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        rng_random
          .shuffle(array)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'number... Remove this comment to see the full error message
          .every((x: any) => array.includes(x))
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not modify the array while shuffling it', () => {
      const array = [1, 2, 3, 4, 5]
      rng_alea.shuffle(array)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        array,
        [1, 2, 3, 4, 5]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles while checking a constraint function', () => {
      const array = [1, 2, 3]
      const constraint = (a: any) => a[0] === 1 && a[1] === 2 && a[2] === 3

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.constrainedShuffle(array, constraint),
        [1, 2, 3]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('constrained shuffle stops after a given number of iterations', () => {
      const array = [1, 2, 3]

      // Shim constraint that always fails
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const constraint = sinon.stub()
      constraint.returns(false)

      const result = rng_alea.constrainedShuffle(array, constraint, {}, 10)

      // Check constraint calls
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        constraint.callCount,
        10
      )
      // Result is still shuffled
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        result,
        [1, 3, 2]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles with minimum distance constraint', () => {
      const array = [1, 2, 2]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.constrainedShuffle(array, { minRepDistance: 2 }),
        [2, 1, 2]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can apply a hash function before calculating distances', () => {
      const array = [{ value: 1 }, { value: 2 }, { value: 2 }]
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.constrainedShuffle(array,
          { minRepDistance: 2 },
          { hash: (x: any) => x.value },
        ),
        [{ value: 2 }, { value: 1 }, { value: 2 }]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles with maximum run length constraint', () => {
      const array = ['a', 'a', 'b', 'b']
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.constrainedShuffle(array, { maxRepSeries: 1 }),
        ['b', 'a', 'b', 'a']
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can apply a custom equality function for evaluating run length', () => {
      const array = [1, '1', 2, '2']
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.constrainedShuffle(array,
          { maxRepSeries: 1 },
          // Allow for type coercion when testing equality
          { equality: (x: any, y: any) => x == y },
        ),
        ['2', '1', 2, 1]
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.shuffleTable(
          table,
          [['a', 'b'], ['c']]
        ),
        output
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        rng_alea.shuffleTable(
          table,
          [['a', 'b'], ['c']],
          false
        ),
        output
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('generates a random v4 uuid', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        rng_alea.uuid4(),
        'bcd644f6-0ee1-4006-bb7b-70dfdcef7c41'
      )
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.match(
        rng_random.uuid4(),
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[8-9a-b][0-9a-f]{3}-[0-9a-f]{12}$/
      )
    })

  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fromObject', () => {

    // The fromObject utility function (currently) assumes that the library
    // is available as a global variable. This is not the case with karma-based
    // testing, so the following code injects the local variable into the
    // global namespace if necessary.
    let libraryInjected = false

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'lab' does not exist on type 'Window & ty... Remove this comment to see the full error message
      if (!window.lab) {
        libraryInjected = true
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'lab' does not exist on type 'Window & ty... Remove this comment to see the full error message
        window.lab = lab
      }

      // Construct a minimal plugin in the global scope
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'MyPlugin' does not exist on type 'Window... Remove this comment to see the full error message
      window.MyPlugin = function MyPlugin() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'handle' does not exist on type 'Window &... Remove this comment to see the full error message
        this.handle = function() {}
      }
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      if (libraryInjected) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'lab' does not exist on type 'Window & ty... Remove this comment to see the full error message
        delete window.lab
      }

      // Remove plugin
      // @ts-expect-error ts-migrate(2551) FIXME: Property 'MyPlugin' does not exist on type 'Window... Remove this comment to see the full error message
      delete window.MyPlugin
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates a lab.js component from a base object', () => {
      const c = lab.util.fromObject({
        type: 'lab.core.Component'
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.instanceOf(c, lab.core.Component)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('transfers options to new object', () => {
      const c = lab.util.fromObject({
        type: 'lab.core.Dummy',
        option: 'value',
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.instanceOf(c, lab.core.Dummy)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(c.options.option, 'value')
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.instanceOf(s.options.content[0], lab.core.Dummy)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(s.options.content[0].options.option, 'value')
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('parses individual nested components', () => {
      const f = lab.util.fromObject({
        type: 'lab.html.Frame',
        content: {
          type: 'lab.core.Dummy',
          option: 'value'
        }
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.instanceOf(f.options.content, lab.core.Dummy)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(f.options.content.options.option, 'value')
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('parses plugins', () => {
      const pluginArgs = {
        type: 'lab.plugins.Debug',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        c.plugins.plugins[0] instanceof lab.plugins.Debug
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('parses plugins from global scope', () => {
      const pluginArgs = {
        type: 'global.MyPlugin',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'MyPlugin' does not exist on type 'Window... Remove this comment to see the full error message
        c.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('loads plugins via the path option', () => {
      const pluginArgs = {
        type: 'global.UnavailablePlugin',
        path: 'global.MyPlugin',
      }

      const c = lab.util.fromObject({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        // @ts-expect-error ts-migrate(2551) FIXME: Property 'MyPlugin' does not exist on type 'Window... Remove this comment to see the full error message
        c.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws error if plugin is not available', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.throws(
        () => lab.util.fromObject({
          type: 'lab.core.Component',
          plugins: [{ path: 'global.UnavailablePlugin' }]
        })
      )
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Geometry', () => {
    const tolerance = Math.pow(10, -5)

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('converts degrees to radians', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.geometry.toRadians(0),
        0,
      )

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.geometry.toRadians(180),
        Math.PI,
      )

      // And so on ...
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates individual vertices of a convex polygon', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 0)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[0], 0, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[1], 100, tolerance)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('generates more than one vertex', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 1)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[0], 100, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[1], 0, tolerance)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shifts the polygon center', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 2, [0, 100])

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[0], 0, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[1], 0, tolerance)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('rotates the polygon if so instructed', () => {
      const vertex = lab.util.geometry.polygonVertex(4, 100, 1, [0, 0], 90)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[0], 0, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertex[1], -100, tolerance)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can generate the complete set of vertices for a polygon', () => {
      const vertices = lab.util.geometry.polygon(8, 100)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[0][0],   0, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[0][1], 100, tolerance)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[1][0], 100*Math.sqrt(2)/2, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[1][1], 100*Math.sqrt(2)/2, tolerance)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[2][0], 100, tolerance)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.closeTo(vertices[2][1],   0, tolerance)

      // To be continued ...
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Tree traversal', () => {

    let s: any, a: any, b: any, c: any, d: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
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

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('traverses nested structure of components', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy()

      lab.util.tree.traverse(s, spy)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCalls().length === 5)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCall(0).calledWith(s))
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCall(1).calledWith(a))
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCall(2).calledWith(b))
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCall(3).calledWith(c))
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(spy.getCall(4).calledWith(d))
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reduces a tree to a specific value', () => {
      s.options.multiplier = 3
      a.options.multiplier = 4
      b.options.multiplier = 5
      c.options.multiplier = 6
      d.options.multiplier = 7

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy((acc: any, c: any) => acc * c.options.multiplier)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.tree.reduce(s, spy, 1),
        2520
      )
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Statistics', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates the sum of an array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.stats.sum([1, 2, 3]),
        6
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates the mean of an array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.stats.mean([1, 2, 3]),
        2
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates the variance of an array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.stats.variance([1, 2, 3]),
        2/3
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calculates the standard deviation of an array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        lab.util.stats.std([1, 2, 3]),
        Math.sqrt(2/3)
      )
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Combinatorics', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('produces set products', () => {
      // Is a generator
      const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.instanceOf(
        lab.util.combinatorics.product,
        GeneratorFunction
      )

      // Behaves correctly
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
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

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('cartesian product accounts for empty sets', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
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
