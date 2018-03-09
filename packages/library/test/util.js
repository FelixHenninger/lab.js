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

    it('provides integers within a given range', () => {
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
    })

    afterEach(() => {
      if (libraryInjected) {
        delete window.lab
      }
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
})

})
