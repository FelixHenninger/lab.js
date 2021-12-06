/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab', '_'], (lab, _) => {

describe('Flow control', () => {

  // Inject a div in which DOM behavior is tested
  let demoElement
  beforeEach(() => {
    demoElement = document.createElement('div')
    demoElement.dataset.labjsSection = 'main'
    document.body.appendChild(demoElement)
  })

  afterEach(() => {
    document.body.removeChild(demoElement)
  })

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
        assert.equal(a.id, '0')
        assert.equal(b.id, '1')
      })
    })

    it('sets id attribute correctly on nested components with id present', () => {
      p.id = '0'
      p.options.content = [a, b]
      return p.prepare().then(() => {
        assert.equal(a.id, '0_0')
        assert.equal(b.id, '0_1')
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

    it('renders the next component on the frame the last one ends', () => {
      const a = new lab.core.Component({ timeout: 16 })
      const b = new lab.core.Component()
      s.options.content = [a, b]

      const p = b.internals.emitter.waitFor('render')

      return s.run()
        .then(() => {
          return p
        }).then(() => {
          assert.equal(
            a.internals.timestamps.end,
            b.internals.timestamps.run,
          )
          assert.equal(
            a.internals.timestamps.switch,
            b.internals.timestamps.show,
          )
        })
    })

    it('runs next component before triggering lock', () => {
      const a = new lab.core.Component()
      const b = new lab.core.Component()
      s.options.content = [a, b]

      // Setup spys
      const b_run = sinon.spy()
      b.on('run', b_run)
      const a_lock = sinon.spy()
      a.on('lock', a_lock)

      return s.run().then(
        () => a.end()
      ).then(() => {
        // TODO: The controller won't wait for pending tasks;
        // figure out a way to signal when these are over
        return new Promise(resolve => setTimeout(resolve, 20))
      }).then(() => {
        assert.ok(a_lock.called)
        assert.ok(b_run.calledBefore(a_lock))
      })
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

      return s.run().then(
        () => s.end()
      ).then(() => {
        assert.equal(
          s.internals.controller.global.datastore.get('foo'),
          'bar',
        )
      })
    })

    it('abort does not trigger outstanding components', () => {
      // Setup sequence
      const a = new lab.core.Component({ name: 'a' })
      const b = new lab.core.Component({ name: 'b' })
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
      }).catch(e => {
        assert.equal(e, `Can't end previously completed component`)
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

    it('adds counter parameter if specified', () => {
      const a = new lab.core.Dummy()
      const b = new lab.core.Dummy()
      s.options.content = [a, b]
      s.options.indexParameter = 'foo'

      return s.prepare().then(() => {
        assert.equal(a.parameters.foo, 0)
        assert.equal(b.parameters.foo, 1)
      })
    })

    it('counts correctly even if content is shuffled', () => {
      // Generate 20 dummy components as content
      s.options.content = _.range(20).map(() => new lab.core.Dummy())

      // Setup shuffle and prepare Sequence
      s.options.shuffle = true
      // Setup counter
      s.options.indexParameter = 'foo'

      return s.prepare().then(() => {
        s.options.content.forEach((c, i) => {
          assert.equal(c.parameters.foo, i)
        })
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

    it('clones template array to create content', () => {
      const t = [
        new lab.core.Component({
          parameters: {
            constantParameter: 'original_one',
            customParameter: 'original',
          },
        }),
        new lab.core.Component({
          parameters: {
            constantParameter: 'original_two',
            customParameter: 'original',
          },
        }),
      ]
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
          l.options.content.every((c, i) =>
            c.options.parameters.constantParameter ===
            t[i % 2].options.parameters.constantParameter
          )
        )

        const expectedValues = ['one', 'two', 'three']
        assert.ok(
          l.options.content.every((c, i) =>
            c.options.parameters.customParameter ===
            expectedValues[Math.floor(i / 2)]
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

    it('issues warning if templateParameters are empty or invalid', () => {
      sinon.stub(console, 'warn')

      return new lab.flow.Loop({
        template: new lab.core.Dummy(),
        templateParameters: undefined,
      }).prepare().then(() => {
        assert.ok(
          console.warn.withArgs(
            'Empty or invalid parameter set for loop, no content generated'
          ).calledOnce
        )
        console.warn.restore()
      })
    })

    it('issues warning if no template, or an invalid one, is provided', () => {
      sinon.stub(console, 'warn')

      // This should someday be replaced by chai-as-promised
      return new lab.flow.Loop({
        template: undefined,
        templateParameters: [{ one: 1 }],
      }).prepare().then(() => {
        assert.ok(
          console.warn.withArgs(
            'Missing or invalid template in loop, no content generated'
          ).calledOnce
        )
        console.warn.restore()
      })
    })

    // Helper function
    const extractParameters = l =>
      l.options.content.map(component => {
        return { a, b, c } = component.options.parameters
      })

    const exampleParameters = [
      { a: 1, b: 1, c: 1 },
      { a: 2, b: 2, c: 2 },
      { a: 3, b: 3, c: 3 },
      { a: 4, b: 4, c: 4 },
    ]

    // TODO: At least one of the following tests is probably redundant,
    // or could be replaced by a spy on this.random.shuffleTable

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

    it('doesn\'t choke when parameters are empty', () => {
      // Catch the warning that is thrown
      sinon.stub(console, 'warn')

      const l = new lab.flow.Loop({
        template: new lab.core.Component()
      })

      return l.run().then(() => {
        assert.ok(console.warn.calledOnce)
        console.warn.restore()
      })
    })

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
        assert.deepEqual(
          l.options.content.map(c => c.options.parameters.customParameter),
          ['one', 'two', 'four'],
        )
      })
    })

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
        assert.equal(
          l.options.content[0].parameters.customParameter, '1'
        )
        assert.equal(
          l.options.content[1].parameters.customParameter, '2'
        )
      })
    })
  })

})

})
