/* global describe, it, beforeEach, assert, sinon */

define(['lab', '_'], (lab, _) => {

describe('Flow control', () => {

  describe('prepare_nested', () => {
    // This is not ideal because the function
    // is not tested directly. Then again, it
    // is not public, so it's difficult to test
    // directly

    let p, a, b
    beforeEach(() => {
      p = new lab.flow.Sequence()
      a = new lab.core.Component()
      b = new lab.core.Component()
    })

    it('distributes hand-me-downs', () => {
      p.options.foo = 'bar'
      b.options.foo = 'baz'

      p.options.content = [a, b]
      p.options.handMeDowns.push('foo')

      return p.prepare().then(() => {
        assert.equal(a.options.foo, 'bar')
        assert.equal(b.options.foo, 'baz')
      })
    })

    it('hand-me-downs do not leak between components', () => {
      p.options.handMeDowns.push('foo')
      const q = new lab.flow.Sequence()

      assert.notOk(
        q.options.handMeDowns.includes('foo')
      )
    })

    it('sets parent attribute', () => {
      p.options.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.parent, p)
        assert.equal(b.parent, p)
      })
    })

    it('sets id attribute correctly on nested components', () => {
      p.options.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.options.id, '0')
        assert.equal(b.options.id, '1')
      })
    })

    it('sets id attribute correctly on nested components with id present', () => {
      p.options.id = '0'
      p.options.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.options.id, '0_0')
        assert.equal(b.options.id, '0_1')
      })
    })

    it('runs prepare on nested components', () => {
      p.options.content = [a, b]

      const a_prepare = sinon.spy()
      const b_prepare = sinon.spy()
      a.on('prepare', a_prepare)
      b.on('prepare', b_prepare)

      assert.notOk(a_prepare.calledOnce)
      assert.notOk(b_prepare.calledOnce)

      return p.prepare().then(() => {
        assert.ok(a_prepare.calledOnce)
        assert.ok(b_prepare.calledOnce)
      })
    })

    it('indicates indirect call to nested items during prepare', () => {
      // Nest item and prepare container (automated preparation)
      const a_prepare = sinon.stub(a, 'prepare')

      p.options.content = [a]
      return p.prepare().then(() => {
        // Prepare should be called on nested components
        // with directCall parameter set to false
        assert.ok(
          a_prepare.withArgs(false).calledOnce
        )
      })
    })
  })

  describe('Sequence', () => {

    let s
    beforeEach(() => {
      s = new lab.flow.Sequence()
    })

    it('runs components in sequence', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Setup spys
      const a_run = sinon.spy()
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)
      let s_end = sinon.spy()
      s.on('end', s_end)

      return s.prepare().then(() => {
        assert.notOk(a_run.called)
        assert.notOk(b_run.called)
        return s.run()
      }).then(() => {
        assert.ok(a_run.calledOnce)
        assert.notOk(b_run.called)
        return a.end()
      }).then(() => {
        assert.ok(a_run.calledOnce)
        assert.ok(b_run.calledOnce)
        // We're not done yet
        assert.notOk(s_end.called)
        return b.end()
      }).then(() => {
        // By now, each component should
        // have run once and the sequence
        // should have ended automatically
        assert.ok(a_run.calledOnce)
        assert.ok(b_run.calledOnce)
        assert.ok(s_end.calledOnce)
      })
    })

    it('doesn\'t choke on empty content', () => {
      s.options.content = []

      return s.run().then(() => {
        assert.equal(s.status, 3)
      })
    })

    it('shuffles content if requested', () => {
      // Generate 100 dummy components as content
      const content = _.range(100).map((i) => {
        const o = new lab.core.Dummy()
        o._test_counter = i
        return o
      })
      // Assign them to the Sequence
      s.options.content = content

      // Setup shuffle and prepare Sequence
      s.options.shuffle = true

      return s.prepare().then(() => {
        // Test that the content has the correct length,
        // and that the order is not the original one
        assert.equal(s.options.content.length, 100)
        assert.notDeepEqual(content, s.options.content)
      })

      // Output internal counter ids for debugging
      // console.log(s.content.map(x => x._test_counter))
    })

    it('terminates current component when aborted', () => {
      // Setup sequence
      const a = new lab.core.Component()
      s.options.content = [a]

      // Spy on the nested component's end method
      const a_end = sinon.spy()
      a.on('end', a_end)

      // Make sure that the nested component is ended
      // when the superordinate component is
      return s.run().then(
        () => s.end()
      ).then(() => {
        assert.ok(a_end.calledOnce)
      })
    })

    it('permits terminated component to log data', () => {
      const a = new lab.core.Component({ data: { foo: 'bar' } })
      s.options.content = [a]
      s.options.datastore = new lab.data.Store()

      return s.run().then(
        () => s.end()
      ).then(() => {
        assert.equal(
          s.options.datastore.get('foo'),
          'bar',
        )
      })
    })

    it('abort does not trigger outstanding components', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      const b_run = sinon.spy()
      b.on('run', b_run)

      return s.run().then(
        // End sequence immediately
        () => s.end()
      ).then(() => {
        // B should not be called
        assert.notOk(b_run.called)

        // This should not happen in practice, since components
        // are rarely ended manually, but it should still not
        // result in the sequence progressing
        return a.end()
      }).then(() => {
        assert.notOk(b_run.called)

        // TODO: Previous versions additionally tested whether
        // calling the stepper method raised an error -- this
        // will need better promise support in the test suite.
      })
    })

    it('updates progress property', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Before everything starts
      assert.equal(s.progress, 0)

      return s.run().then(() => {
        assert.equal(s.progress, 0)
        // End first nested component
        return a.end()
      }).then(() => {
        assert.equal(s.progress, 0.5)
        // End second nested component
        return b.end()
      }).then(() => {
        assert.equal(s.progress, 1)
      })
    })

    it('throws error when there is no content left to step through', () => {
      // Setup sequence
      const a = new lab.core.Dummy()
      s.options.content = [a]

      let error

      return s.run().then(() => {
        s.step().catch(err => (error = err))
      }).then(() => {
        assert.equal(
          error.message,
          'Sequence ended, can\'t take any more steps'
        )
      })
    })
  })

  describe('Loop', () => {

    it('clones template to create content', () => {
      const t = new lab.core.Component({
        parameters: {
          constantParameter: 'original',
          customParameter: 'original',
        },
      })
      const l = new lab.flow.Loop({
        template: t,
        templateParameters: [
          { customParameter: 'one' },
          { customParameter: 'two' },
          { customParameter: 'three' },
        ],
      })

      return l.prepare().then(() => {
        assert.ok(
          l.options.content.every(c =>
            c.options.parameters.constantParameter ===
            t.options.parameters.constantParameter
          )
        )

        const expectedValues = ['one', 'two', 'three']
        assert.ok(
          l.options.content.every((c, i) =>
            c.options.parameters.customParameter === expectedValues[i]
          )
        )
      })
    })

    it('uses a template function to generate content', () => {
      const l = new lab.flow.Loop({
        template: p => new lab.core.Component({
          parameters: _.assignIn({ constantParameter: 'constant' }, p),
        }),
        templateParameters: [
          { customParameter: 'one' },
          { customParameter: 'two' },
          { customParameter: 'three' },
        ],
      })

      return l.prepare().then(() => {
        assert.ok(
          l.options.content.every(c =>
            c.options.parameters.constantParameter === 'constant'
          )
        )

        const expectedValues = ['one', 'two', 'three']
        assert.ok(
          l.options.content.every((c, i) =>
            c.options.parameters.customParameter === expectedValues[i]
          )
        )
      })
    })

    it('issues warning if no template, or an invalid one, is provided', () => {
      sinon.stub(console, 'warn')

      // This should someday be replaced by chai-as-promised
      return new lab.flow.Loop().prepare().then(() => {
        assert.ok(
          console.warn.withArgs(
            'Missing or invalid template in loop, no content generated'
          ).calledOnce
        )
        console.warn.restore()
      })
    })

    it('doesn\'t choke when parameters are empty', () => {
      const l = new lab.flow.Loop({
        template: new lab.core.Component()
      })

      return l.run().then(() => {
        assert.equal(l.status, 3)
      })
    })
  })

  describe('Parallel', () => {

    let p, a, b
    beforeEach(() => {
      a = new lab.core.Component()
      b = new lab.core.Component()
      p = new lab.flow.Parallel({
        content: [a, b]
      })
    })

    it('runs components in parallel', () => {
      const a_run = sinon.spy()
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)

      return p.prepare().then(() => {
        assert.notOk(a_run.called)
        assert.notOk(b_run.called)

        return p.run()
      }).then(() => {
        assert.ok(a_run.calledOnce)
        assert.ok(b_run.calledOnce)
      })
    })

    it('ends components in parallel', () => {
      const a_end = sinon.spy()
      const b_end = sinon.spy()
      a.on('end', a_end)
      b.on('end', b_end)

      return p.run().then(() => {
        assert.notOk(a_end.called)
        assert.notOk(b_end.called)
        return p.end()
      }).then(() => {
        assert.ok(a_end.calledOnce)
        assert.ok(b_end.calledOnce)
      })
    })

    it('implements race mode (by default)', () => {
      let b_end = sinon.spy()
      b.on('end', b_end)
      let p_end = sinon.spy()
      p.on('end', p_end)

      return p.run().then(() => {
        assert.notOk(b_end.called)
        return a.end()
      }).then(() => {
        assert.ok(b_end.calledOnce)
        assert.ok(p_end.calledOnce)
      })
    })

    it('implements no-component-left-behind mode (mode=all)', () => {
      p.options.mode = 'all'
      let p_end = sinon.spy()
      p.on('end', p_end)

      return p.run().then(
        () => a.end()
      ).then(() => {
        assert.notOk(p_end.called)
        return b.end()
      }).then(() => {
        assert.ok(p_end.calledOnce)
      })
    })

    it('updates the progress property', () => {
      // This is a tough one :-)
      const a1 = new lab.core.Component()
      const a2 = new lab.core.Component()
      const b1 = new lab.core.Component()
      const b2 = new lab.core.Component()
      const b3 = new lab.core.Component()
      const a = new lab.flow.Sequence({
        content: [a1, a2]
      })
      const b = new lab.flow.Sequence({
        content: [b1, b2, b3]
      })
      p.options.content = [a, b]

      return p.run().then(() => {
        assert.equal(p.progress, 0)
        return a1.end()
      }).then(() => {
        assert.equal(p.progress, 0.25)
        return b1.end()
      }).then(() => {
        assert.closeTo(p.progress, 2.5/6, Math.exp(10, -5))
        return b2.end()
      }).then(() => {
        assert.closeTo(p.progress, 3.5/6, Math.exp(10, -5))
        return a2.end()
      }).then(() => {
        assert.closeTo(p.progress, 5/6, Math.exp(10, -5))
        return b3.end()
      }).then(() => {
        assert.equal(p.progress, 1)
      })
    })
  })

})

})
