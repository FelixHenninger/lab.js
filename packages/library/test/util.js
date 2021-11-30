/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Utilities', () => {
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
})

})
