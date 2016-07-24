describe('Flow control', () => {

  describe('prepare_nested', () => {
    // This is not ideal because the function
    // is not tested directly. However, the function
    // is not public, so it's difficult to test
    // directly

    let p, a, b
    beforeEach(() => {
      p = new lab.Sequence()
      a = new lab.BaseElement()
      b = new lab.BaseElement()
    })

    it('distributes hand-me-downs', () => {
      p.foo = 'bar'
      b.foo = 'baz'

      p.content = [a, b]
      p.handMeDowns.push('foo')

      return p.prepare().then(() => {
        assert.equal(a.foo, 'bar')
        assert.equal(b.foo, 'baz')
      })
    })

    it('hand-me-downs do not leak between elements', () => {
      p.handMeDowns.push('foo')
      const q = new lab.Sequence()

      assert.notOk(
        q.handMeDowns.includes('foo')
      )
    })

    it('sets parent attribute', () => {
      p.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.parent, p)
        assert.equal(b.parent, p)
      })
    })

    it('sets id attribute correctly on nested elements', () => {
      p.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.id, '0')
        assert.equal(b.id, '1')
      })
    })

    it('sets id attribute correctly on nested elements with id present', () => {
      p.id = '0'
      p.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.id, '0_0')
        assert.equal(b.id, '0_1')
      })
    })

    it('runs prepare on nested elements', () => {
      p.content = [a, b]

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

      p.content = [a]
      p.prepare().then(() => {
        // Prepare on nested elements should be called
        // with direct_call parameter set to false
        assert.ok(
          a_prepare.withArgs(false).calledOnce
        )
      })
    })
  })

  describe('Sequence', () => {

    let s
    beforeEach(() => {
      s = new lab.Sequence([], {})
    })

    it('runs elements in sequence', () => {
      // Setup sequence
      const a = new lab.BaseElement()
      const b = new lab.BaseElement()
      s.content = [a, b]

      // Setup spys
      const a_run = sinon.spy()
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)
      let s_end = sinon.spy()
      s.on('end', s_end)


      const tasks = [
        () => {
          // Prepare sequence
          return s.prepare().then(() => {
            assert.notOk(a_run.called)
            assert.notOk(b_run.called)
          })
        },
        () => {
          // Run
          // A goes first
          let p = s.waitFor('run').then(() => {
            assert.ok(a_run.calledOnce)
            assert.notOk(b_run.called)
          })
          s.run()
          return p
        },
        () => {
          // B follows
          let p = a.waitFor('end', () => {
            assert.ok(a_run.calledOnce)
            assert.ok(b_run.calledOnce)
          })
          a.end()
          return p
        },
        () => {
          // We're not done yet
          assert.notOk(s_end.called)
          // The sequence ends
          b.end()
        },
        () => {
          // By now, each element should
          // have run once and the sequence
          // should have ended automatically
          assert.ok(a_run.calledOnce)
          assert.ok(b_run.calledOnce)
          assert.ok(s_end.calledOnce)
        }
      ]

      return tasks.reduce((chain, f) => {
        return chain.then(f)
      }, Promise.resolve())
    })

    it('shuffles elements if requested', () => {
      // Generate 100 DummyElements as content
      const content = _.range(100).map((i) => {
        const o = new lab.DummyElement()
        o._test_counter = i
        return o
      })
      // Assign them to the Sequence
      s.content = content

      // Setup shuffle and prepare Sequence
      s.shuffle = true

      return s.prepare().then(() => {
        // Test that the content has the correct length,
        // and that the order is not the original one
        assert.equal(s.content.length, 100)
        assert.notDeepEqual(content, s.content)
      })

      // Output internal counter ids for debugging
      // console.log(s.content.map(x => x._test_counter))
    })

    it('terminates current element when aborted', () => {
      // Setup sequence
      const a = new lab.BaseElement()
      s.content = [a]

      // Run
      s.run()

      // Spy on the nested element's end method
      const a_end = sinon.spy()
      a.on('end', a_end)

      return s.waitFor('run').then(() => {
        // Make sure that the nested element is ended
        // when the superordinate element is
        s.end()
        assert.ok(a_end.calledOnce)
      })
    })

    it('deactivates stepper when ended', () => {
      // Setup sequence
      const a = new lab.BaseElement()
      const b = new lab.BaseElement()
      s.content = [a, b]

      const b_run = sinon.spy()
      b.on('run', b_run)


      const p = s.waitFor('run').then(() => {
        // A stepper function should exist at this point
        assert.isFunction(s.stepper)

        // End sequence
        s.end()

        // This should not happen in practice, since elements
        // are rarely ended manually, but it should still not
        // result in the sequence progressing
        a.end()
        assert.notOk(b_run.called)

        // Just in case someone tries to run the stepper
        // function manually, this should not work
        assert.throws(
          () => s.stepper(), // Try stepper function
          's.stepper is not a function'
        )
      })

      s.run()
      return p
    })
  })

  describe('Parallel', () => {

    let p, a, b
    beforeEach(() => {
      a = new lab.BaseElement()
      b = new lab.BaseElement()
      p = new lab.Parallel([a, b], {})
    })

    it('runs elements in parallel', () => {
      const a_run = sinon.spy()
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)

      const output = Promise.all([
        p.waitFor('prepare').then(() => {
          // Prepare ...
          assert.notOk(a_run.called)
          assert.notOk(b_run.called)

          p.run()
        }),
        p.waitFor('run').then(() => {
          // ... and run
          assert.ok(a_run.calledOnce)
          assert.ok(b_run.calledOnce)
        })
      ])

      p.prepare()
      return output
    })

    it('ends elements in parallel', () => {
      const a_end = sinon.spy()
      const b_end = sinon.spy()
      a.on('end', a_end)
      b.on('end', b_end)

      p.run()
      return p.waitFor('run').then(() => {
        assert.notOk(a_end.called)
        assert.notOk(b_end.called)
        p.end()
        assert.ok(a_end.calledOnce)
        assert.ok(b_end.calledOnce)
      })
    })

    it('implements race mode (by default)', () => {
      let b_end = sinon.spy()
      b.on('end', b_end)
      let p_end = sinon.spy()
      p.on('end', p_end)

      const output = p.run().then(() => {
        assert.ok(b_end.calledOnce)
        assert.ok(p_end.calledOnce)
      })

      assert.notOk(b_end.called)
      a.end()

      return output
    })

    it('implements no-element-left-behind mode (mode=all)', () => {
      p.mode = 'all'
      let p_end = sinon.spy()
      p.on('end', p_end)

      const output = p.run()

      a.end()
      assert.notOk(p_end.called)
      b.end()

      return output.then(() => {
        assert.ok(p_end.calledOnce)
      })
    })

  })

})
