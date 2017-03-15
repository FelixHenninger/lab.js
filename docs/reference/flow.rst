Flow control
============

.. _reference/flow:

This part of the library provides components that control the sequence of events during the experiment. It is thus responsible for the *flow* of Components throughout the experiment. For example, a :js:class:`flow.Sequence` groups several components together to be run sequentially, a :js:class:`flow.Loop` repeats single components, and a :js:class:`flow.Parallel` runs multiple components in parallel.

----

.. _reference/flow/sequence:

Sequence
--------

.. js:class:: flow.Sequence([options])

  A :js:class:`flow.Sequence` runs a group of components one after another. These can be any type of component -- screens or other stimuli, and even other sequences or loops.

  A typical experiment will often, on the highest, most coarse level, consist of a single sequence that encompasses the entirety of the experiment -- instructions, experimental task, and debriefing -- and runs it in sequence.

  Sequences are, however, also useful on a much more granular level -- for example, a single trial can be built as a sequence of an inter-stimulus interval, a fixation dot, and the stimulus itself.

  .. js:attribute:: options.content

    List of components to run in sequence (``[]``)

    When a :js:class:`flow.Sequence` is constructed, the most important option is the content, which is a list of 'sub-components' that the sequence is comprised of. A basic example might be the following [#f1]_::

      const proclaimers = new lab.flow.Sequence({
        content: [
          new lab.html.Screen({ content: 'And',   timeout: 500 }),
          new lab.html.Screen({ content: 'I',     timeout: 500 }),
          new lab.html.Screen({ content: 'will',  timeout: 500 }),
          new lab.html.Screen({ content: 'walk',  timeout: 500 }),
          new lab.html.Screen({ content: 'five',  timeout: 500 }),
          new lab.html.Screen({ content: 'hun-',  timeout: 500 }),
          new lab.html.Screen({ content: '-dred', timeout: 500 }),
          new lab.html.Screen({ content: 'miles', timeout: 500 }),
        ],
      })

      proclaimers.run()

    When the sequence is prepared or run, the constituent parts are prepared and run in sequence.

  .. js:attribute:: options.shuffle

    Run the content components in random order (``false``)

    If this option is set to ``true``, the :js:attr:`content <options.content>` of the sequence is shuffled during the prepare phase.

  .. js:attribute:: options.handMeDowns

    List of options passed to nested components (``['datastore', 'el', 'debug']``)

    The options specified as ``handMeDowns`` are transferred to nested components during the prepare phase. This option is largely for convenience, and designed to decrease the amount of repetition when all nested components behave similarly -- typically, nested components share the same data storage and output element, so these are passed on by default. Similarly, the :js:attr:`debug <options.debug>` mode is easiest to set on the topmost component, and will automatically propagate to include all other components.

----

.. _reference/flow/loop:

Loop
----

.. js:class:: flow.Loop([options])

  A :js:class:`flow.Loop` repeats the same (single) :js:attr:`template <options.template>` component, while varying :js:attr:`parameters <options.parameters>` between repetitions. Keeping with our example above::

    const template = new lab.html.Screen({
      content: '${ parameters.lyrics      }', // parameters substituted ...
      timeout: '${ parameters.beats * 600 }', // ... during preparation
    })

    const spandauBallet = new lab.flow.Loop({
      template: template,
      templateParameters: [
        /* ... */
        { lyrics: 'So true, funny how it seems', beats: 7 },
        { lyrics: 'Always in time, but never in line for dreams', beats: 10 },
        { lyrics: 'Head over heels when toe to toe', beats: 8 },
        { lyrics: 'This is the sound of my soul', beats: 8 },
        /* ... */
      ]
    })

  In many cases, the template will not be a single :js:class:`html.Screen`, but rather a :js:class:`flow.Sequence`, so that multiple screens can be repeated on each iteration.

  .. js:attribute:: options.template

    Content for each repetition of the loop.

    There are several ways in which this option can be used:

    * First it can be a **single component** of any type, an :js:class:`html.Screen`, (most likely) a :js:class:`flow.Sequence` or even another :js:class:`flow.Loop`. This component will be :js:func:`cloned <clone>` for each iteration, and the :js:attr:`parameters <options.parameters>` substituted on each copy so that the repetitions can differ from another.
    * Second, it can be a **function** that creates and returns the component for each iteration. This function will receive each set of :js:attr:`templateParameters <options.templateParameters>` in turn as a first argument (and, optionally, the index as a second argument). The advantage of this method is a greater flexibility: More logic can be used at every step to customize every iteration.

  .. js:attribute:: options.templateParameters

    Array of parameter sets for each individual repetition  (``[]``).

    This option defines the parameters for every repetition of the :js:attr:`template <options.template>`. Each individual set of parameters is defined as an object with name/value pairs, and these objects are combined to an array::

        const stroopTrials = [
          { color: 'red', word: 'red' },
          { color: 'red', word: 'blue' },
          /* ... */
        ]

        const stroopTask = new lab.flow.Loop({
          template: /* ... */,
          templateParameters: stroopTrials,
        })

  .. js:attribute:: options.shuffle

    Whether to shuffle iterations (``false``, see :js:class:`flow.Sequence`).

  .. js:attribute:: options.handMeDowns

    Options to pass to subordinate components (see :js:class:`flow.Sequence`).
----

.. _reference/flow/parallel:

Parallel
--------

.. js:class:: flow.Parallel([options])

  A :js:class:`flow.Parallel` component runs other components concurrently, in that they are started together. Browser engines do not currently support literally parallel processing, but an effort has been made to approximate parallel processing as closely as possible.

  .. js:attribute:: options.content

    List of components to run in parallel (``[]``)

  .. js:attribute:: options.mode

    How to react to nested elements ending (``'race'``)

    If this option is set to ``'race'``, the entire :js:class:`flow.Parallel` component ends as soon as the first nested component ends. In this case, any remaining components are shut down automatically (by calling :js:func:`end`). If the mode is set to ``'all'``, it waits until all nested items have ended by themselves.

  .. js:attribute:: options.handMeDowns

    Options passed to nested elements (see :js:class:`flow.Sequence`).

----

.. [#f1] In apology to our British colleagues: This is, obviously,
  a grossly distorted version of the classic anthem: According to XKCD, `the song has 131.9 beats per minute <https://what-if.xkcd.com/58/>`_; the appropriate adjustment, as well as the Scottish accent, are left as an exercise for our esteemed readers.
  We hereby also pledge to award special prizes to any colleagues who use the library for interdepartmental karaoke (video proof required).
