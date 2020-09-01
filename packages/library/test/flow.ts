/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab', '_'], (lab: any, _: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Flow control', () => {

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('prepare_nested', () => {
    // This is not ideal because the function
    // is not tested directly. Then again, it
    // is not public, so it's difficult to test
    // directly

    let p: any, a: any, b: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      p = new lab.flow.Sequence()
      a = new lab.core.Component()
      b = new lab.core.Component()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('distributes hand-me-downs', () => {
      p.options.foo = 'bar'
      b.options.foo = 'baz'

      p.options.content = [a, b]
      p.options.handMeDowns.push('foo')

      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(a.options.foo, 'bar')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.options.foo, 'baz')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('hand-me-downs do not leak between components', () => {
      p.options.handMeDowns.push('foo')
      const q = new lab.flow.Sequence()

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(
        q.options.handMeDowns.includes('foo')
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets parent attribute', () => {
      p.options.content = [a, b]
      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(a.parent, p)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.parent, p)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets id attribute correctly on nested components', () => {
      p.options.content = [a, b]
      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(a.options.id, '0')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.options.id, '1')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets id attribute correctly on nested components with id present', () => {
      p.options.id = '0'
      p.options.content = [a, b]
      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(a.options.id, '0_0')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.options.id, '0_1')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs prepare on nested components', () => {
      p.options.content = [a, b]

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_prepare = sinon.spy()
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_prepare = sinon.spy()
      a.on('prepare', a_prepare)
      b.on('prepare', b_prepare)

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(a_prepare.calledOnce)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(b_prepare.calledOnce)

      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_prepare.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_prepare.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('indicates indirect call to nested items during prepare', () => {
      // Nest item and prepare container (automated preparation)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_prepare = sinon.stub(a, 'prepare')

      p.options.content = [a]
      return p.prepare().then(() => {
        // Prepare should be called on nested components
        // with directCall parameter set to false
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          a_prepare.withArgs(false).calledOnce
        )
      })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Sequence', () => {

    let s: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      s = new lab.flow.Sequence()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs components in sequence', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Setup spys
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_run = sinon.spy()
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      let s_end = sinon.spy()
      s.on('end', s_end)

      return s.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(a_run.called)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_run.called)
        return s.run()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_run.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_run.called)
        return a.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_run.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_run.calledOnce)
        // We're not done yet
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(s_end.called)
        return b.end()
      }).then(() => {
        // By now, each component should
        // have run once and the sequence
        // should have ended automatically
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_run.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_run.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(s_end.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('doesn\'t choke on empty content', () => {
      s.options.content = []

      return s.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(s.status, 3)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles content if requested', () => {
      // Generate 100 dummy components as content
      const content = _.range(100).map((i: any) => {
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(s.options.content.length, 100)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notDeepEqual(content, s.options.content)
      })

      // Output internal counter ids for debugging
      // console.log(s.content.map(x => x._test_counter))
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('renders the next component on the frame the last one ends', () => {
      const a = new lab.core.Component({ timeout: 16 })
      const b = new lab.core.Component()
      s.options.content = [a, b]

      const p = b.waitFor('render')

      return s.run()
        .then(() => {
          return p
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            a.internals.timestamps.end,
            b.internals.timestamps.render,
          )
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            a.internals.timestamps.switch,
            b.internals.timestamps.show,
          )
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs next component before triggering epilogue', () => {
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Setup spys
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_run = sinon.spy()
      b.on('run', b_run)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_epilogue = sinon.spy()
      a.on('epilogue', a_epilogue)

      return s.run().then(
        () => a.end()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_run.calledBefore(a_epilogue))
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('terminates current component when aborted', () => {
      // Setup sequence
      const a = new lab.core.Component()
      s.options.content = [a]

      // Spy on the nested component's end method
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_end = sinon.spy()
      a.on('end', a_end)

      // Make sure that the nested component is ended
      // when the superordinate component is
      return s.run().then(
        () => s.end()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_end.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('permits terminated component to log data', () => {
      const a = new lab.core.Component({ data: { foo: 'bar' } })
      s.options.content = [a]
      s.options.datastore = new lab.data.Store()

      return s.run().then(
        () => s.end()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          s.options.datastore.get('foo'),
          'bar',
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('abort does not trigger outstanding components', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_run = sinon.spy()
      b.on('run', b_run)

      return s.run().then(
        // End sequence immediately
        () => s.end()
      ).then(() => {
        // B should not be called
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_run.called)

        // This should not happen in practice, since components
        // are rarely ended manually, but it should still not
        // result in the sequence progressing
        return a.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_run.called)

        // TODO: Previous versions additionally tested whether
        // calling the stepper method raised an error -- this
        // will need better promise support in the test suite.
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('updates progress property', () => {
      // Setup sequence
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Before everything starts
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(s.progress, 0)

      return s.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(s.progress, 0)
        // End first nested component
        return a.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(s.progress, 0.5)
        // End second nested component
        return b.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(s.progress, 1)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws error when there is no content left to step through', () => {
      // Setup sequence
      const a = new lab.core.Dummy()
      s.options.content = [a]

      return s.run().then(() => {
        // Step beyond last sequence content, resolve error
        // TODO: Extracting the error message here is not nice --
        // it would be nicer to use chai-as-promised and assert.isRejected
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        return new Promise((resolve: any) => s.step().catch(resolve));
      }).then((error: any) => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          error.message,
          'Sequence ended, can\'t take any more steps'
        )
      });
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Loop', () => {

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          l.options.content.every((c: any) => c.options.parameters.constantParameter ===
          t.options.parameters.constantParameter
          )
        )

        const expectedValues = ['one', 'two', 'three']
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          l.options.content.every((c: any, i: any) =>
            c.options.parameters.customParameter === expectedValues[i]
          )
        )
      });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('uses a template function to generate content', () => {
      const l = new lab.flow.Loop({
        template: (p: any) => new lab.core.Component({
          parameters: _.assignIn({ constantParameter: 'constant' }, p),
        }),
        templateParameters: [
          { customParameter: 'one' },
          { customParameter: 'two' },
          { customParameter: 'three' },
        ],
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          l.options.content.every((c: any) => c.options.parameters.constantParameter === 'constant'
          )
        )

        const expectedValues = ['one', 'two', 'three']
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          l.options.content.every((c: any, i: any) =>
            c.options.parameters.customParameter === expectedValues[i]
          )
        )
      });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('issues warning if templateParameters are empty or invalid', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      sinon.stub(console, 'warn')

      return new lab.flow.Loop({
        template: new lab.core.Dummy(),
        templateParameters: undefined,
      }).prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'withArgs' does not exist on type '{ (...... Remove this comment to see the full error message
          console.warn.withArgs(
            'Empty or invalid parameter set for loop, no content generated'
          ).calledOnce
        )
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
        console.warn.restore()
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('issues warning if no template, or an invalid one, is provided', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      sinon.stub(console, 'warn')

      // This should someday be replaced by chai-as-promised
      return new lab.flow.Loop({
        template: undefined,
        templateParameters: [{ one: 1 }],
      }).prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'withArgs' does not exist on type '{ (...... Remove this comment to see the full error message
          console.warn.withArgs(
            'Missing or invalid template in loop, no content generated'
          ).calledOnce
        )
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
        console.warn.restore()
      })
    })

    // Helper function
    const extractParameters = (l: any) => l.options.content.map((component: any) => {
      // @ts-expect-error ts-migrate(18004) FIXME: No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      return ({ a, b, c } = component.options.parameters);
    })

    const exampleParameters = [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
      { a: 4, b: 4, c: 4 },
    ]

    // TODO: At least one of the following tests is probably redundant,
    // or could be replaced by a spy on this.random.shuffleTable

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles parameter table if requested', () => {
      const l = new lab.flow.Loop({
        // Seed PRNG for reproducibility
        random: {
          algorithm: 'alea',
          seed: 'abcd',
        },
        shuffleGroups: [
          ['a', 'b'],
          ['c']
        ],
        template: new lab.core.Component(),
        templateParameters: exampleParameters,
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          extractParameters(l),
          [
            { a: 1, b: 1, c: 3 },
            { a: 2, b: 2, c: 4 },
            { a: 4, b: 4, c: 1 },
            { a: 3, b: 3, c: 2 }
          ]
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('doesn\'t shuffle unnamed parameters by default', () => {
      const l = new lab.flow.Loop({
        // Seed PRNG for reproducibility
        random: {
          algorithm: 'alea',
          seed: 'abcd',
        },
        shuffleGroups: [
          ['a', 'b'],
        ],
        template: new lab.core.Component(),
        templateParameters: exampleParameters,
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          extractParameters(l),
          [
            { a: 1, b: 1, c: 1 },
            { a: 2, b: 2, c: 2 },
            { a: 4, b: 4, c: 3 },
            { a: 3, b: 3, c: 4 },
          ]
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shuffles unnamed parameters if told to', () => {
      const l = new lab.flow.Loop({
        // Seed PRNG for reproducibility
        random: {
          algorithm: 'alea',
          seed: 'abcd',
        },
        shuffleGroups: [
          ['a'], ['c'],
        ],
        shuffleUngrouped: true,
        template: new lab.core.Component(),
        templateParameters: exampleParameters,
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          extractParameters(l),
          [
            { a: 1, b: 4, c: 3 },
            { a: 2, b: 2, c: 4 },
            { a: 4, b: 3, c: 1 },
            { a: 3, b: 1, c: 2 }
          ]
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('doesn\'t choke when parameters are empty', () => {
      // Catch the warning that is thrown
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      sinon.stub(console, 'warn')

      const l = new lab.flow.Loop({
        template: new lab.core.Component()
      })

      return l.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(l.status, 3)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(console.warn.calledOnce)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
        console.warn.restore()
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('subsamples content if so instructed', () => {
      const l = new lab.flow.Loop({
        // Seed PRNG for reproducibility
        random: {
          algorithm: 'alea',
          seed: 'abcd',
        },
        sample: {
          n: 3,
        },
        template: new lab.core.Component(),
        templateParameters: [
          { customParameter: 'one' },
          { customParameter: 'two' },
          { customParameter: 'three' },
          { customParameter: 'four' },
        ],
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          l.options.content.map((c: any) => c.options.parameters.customParameter),
          ['one', 'two', 'four'],
        )
      });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('parses template parameter content', () => {
      const l = new lab.flow.Loop({
        parameters: {
          one: '1',
          two: '2',
        },
        template: new lab.core.Component(),
        templateParameters: [
          { customParameter: '${ this.parameters.one }' },
          { customParameter: '${ this.parameters.two }' },
        ],
      })

      return l.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          l.options.content[0].parameters.customParameter, '1'
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          l.options.content[1].parameters.customParameter, '2'
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('doesn\'t skip frames when wrapping sequence', () => {
      // Simulate timers
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'clock'.
      clock = sinon.useFakeTimers({
        shouldAdvanceTime: true
      })

      // Capture nested screens in an array
      const screens: any = []

      // Simulate a trial structure, with a loop,
      // a nested trial sequence, and a screen within.
      const l = new lab.flow.Loop({
        title: 'Loop',
        template: (i: any) => {
          const screen = new lab.canvas.Screen({
            timeout: 32,
            title: `Screen ${ i }`,
          })
          screens.push(screen)

          return new lab.flow.Sequence({
            title: `Sequence ${ i }`,
            content: [ screen ]
          })
        },
        templateParameters: [1, 2],
        el: document.createElement('div'),
      })

      return l.run().then(() => {
        return l.waitFor('end')
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          screens[0].internals.timestamps.end,
          screens[1].internals.timestamps.render,
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          screens[0].internals.timestamps.switch,
          screens[1].internals.timestamps.show,
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'clock'.
        clock.restore()
      })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Parallel', () => {

    let p: any, a: any, b: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      a = new lab.core.Component()
      b = new lab.core.Component()
      p = new lab.flow.Parallel({
        content: [a, b]
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('prepares nested components', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_prepare = sinon.spy()
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_prepare = sinon.spy()
      a.on('prepare', a_prepare)
      // Add a lengthy preparation step
      a.on('prepare', function() {
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        return new Promise((resolve: any) => setTimeout(resolve, 25));
      })
      b.on('prepare', b_prepare)

      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(a.status, 1)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.status, 1)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_prepare.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_prepare.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs components in parallel', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_run = sinon.spy()
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_run = sinon.spy()
      a.on('run', a_run)
      b.on('run', b_run)

      return p.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(a_run.called)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_run.called)

        return p.run()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_run.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_run.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('ends components in parallel', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const a_end = sinon.spy()
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const b_end = sinon.spy()
      a.on('end', a_end)
      b.on('end', b_end)

      return p.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(a_end.called)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_end.called)
        return p.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(a_end.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_end.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('implements race mode (by default)', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      let b_end = sinon.spy()
      b.on('end', b_end)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      let p_end = sinon.spy()
      p.on('end', p_end)

      return p.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(b_end.called)
        return a.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(b_end.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(p_end.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('implements no-component-left-behind mode (mode=all)', () => {
      p.options.mode = 'all'
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      let p_end = sinon.spy()
      p.on('end', p_end)

      return p.run().then(
        () => a.end()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(p_end.called)
        return b.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(p_end.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(p.progress, 0)
        return a1.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(p.progress, 0.25)
        return b1.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.closeTo(p.progress, 2.5/6, Math.exp(10, -5))
        return b2.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.closeTo(p.progress, 3.5/6, Math.exp(10, -5))
        return a2.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.closeTo(p.progress, 5/6, Math.exp(10, -5))
        return b3.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(p.progress, 1)
      })
    })
  })

})

})
