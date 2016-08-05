Flow control
============

This part of the library provides components that control the sequence of events
during the experiment. It thus is responsible for the *flow* of Components
throughout the experiment. For example, a :js:class:`flow.Sequence` groups
several components together to be run sequentially, and a
:js:class:`flow.Parallel` runs multiple components in parallel.

----

.. _reference/flow/sequence:

Sequence
--------

.. js:class:: flow.Sequence([options])

  A :js:class:`flow.Sequence` runs a group of elements one after another. These
  can be any type of component -- screens or other stimuli, and even other
  sequences.

  A typical experiment will often, on the highest, most coarse level, consist of
  a single sequence that encompasses the entirety of the experiment --
  instructions, experimental task, and debriefing.

  Sequences are, however, also useful on a much more granular level -- for
  example, a single trial can be programmed as a sequence of an inter-stimulus
  interval, a fixation dot, and the stimulus itself.

  .. js:attribute:: content

    List of components to run in sequence (``[]``)

    When a :js:class:`flow.Sequence` is constructed, the most important option
    is the content, which is a list of 'sub-components' that the sequence is
    comprised of. A basic example might be the following [#f1]_::

      var proclaimers = new lab.flow.Sequence({
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

    When the sequence is prepared or run, the constituent parts are prepared
    and run in sequence.

  .. js:attribute:: shuffle

    Run the content components in random order (``false``)

    If this option is set to ``true``, the :js:attr:`content` of the sequence
    is shuffled during the prepare phase.

  .. js:attribute:: handMeDowns

    List of options passed to nested components
    (``['datastore', 'el', 'debug']``)

    The options/attributes set in this option are set on nested components
    during the prepare phase.
    This option is largely for convenience, and designed to decrease the amount
    of repetition when all nested components behave similarly -- typically,
    nested components share the same data storage and output element, so these
    are passed on by default. Similarly, the :js:attr:`debug` mode is easiest to
    set on the topmost component, and will automatically propagate to include
    all other components.

----

.. _reference/flow/parallel:

Parallel
--------

.. js:class:: flow.Parallel([options])

  A :js:class:`flow.Parallel` component runs other components concurrently, in
  that they are started together. Browser engines do not currently support
  literally parallel processing, but an effort has been made to approximate
  parallel processing as closely as possible.

  .. js:attribute:: content

    List of components to run in parallel (``[]``)

  .. js:attribute:: mode

    How to react to nested elements ending (``'race'``)

    If this option is set to ``'race'``, the entire :js:class:`flow.Parallel`
    component ends as soon as the first nested component ends. In this case, any
    remaining components are shut down automatically (by calling
    :js:func:`end`). If the mode is set to ``'all'``, it waits until all nested
    items have ended by themselves.

  .. js:attribute:: handMeDowns

    Options passed to nested elements

    Exactly analogous to the correspondent option for sequences.

----

.. [#f1] In apology to our British colleagues: This is, obviously,
  a grossly distorted version of the classic anthem:
  According to XKCD, `the song has 131.9 beats per minute
  <https://what-if.xkcd.com/58/>`_; the appropriate adjustment,
  as well as the Scottish accent, are left as an exercise for our
  esteemed readers.
  We hereby also pledge to award special prizes to any colleagues who
  use the library for interdepartmental karaoke (video proof required).
