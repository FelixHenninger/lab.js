Flow control
============

Elements whose primary purpose is to control the sequence of events during
the experiment are summarized in this section as *flow control*. For example,
a ``Sequence`` groups several elements together to be run sequentially.

----

.. _reference/flow/sequence:

Sequence
--------

A ``Sequence`` runs a group of elements one after another. These can be any type
of elements -- screens or other stimuli, or even other sequences or other flow
control elements.

A typical experiment will often, on the highest, most coarse level, consist of
a single ``Sequence`` that encompasses the entirety of the experiment --
instructions, experimental task, and debriefing.

Sequences are, however, also useful on a much lower level -- for example,
a single trial can be programmed as a sequence of inter-stimulus interval,
fixation dot, and the stimulus itself.

Usage
^^^^^

When a ``Sequence`` is constructed, it can be supplied with two arguments. The
first is the list of 'sub-elements' that the sequence is comprised of. The
second is a set of options analogous to those for any element.

A basic example might be the following [#f1]_::

  var proclaimers = new lab.Sequence(
    [
      new lab.HTMLScreen('And',   { 'timeout': 500 }),
      new lab.HTMLScreen('I',     { 'timeout': 500 }),
      new lab.HTMLScreen('will',  { 'timeout': 500 }),
      new lab.HTMLScreen('walk',  { 'timeout': 500 }),
      new lab.HTMLScreen('five',  { 'timeout': 500 }),
      new lab.HTMLScreen('hun-',  { 'timeout': 500 }),
      new lab.HTMLScreen('-dred', { 'timeout': 500 }),
      new lab.HTMLScreen('miles', { 'timeout': 500 })
    ],
    {
      'el': document.getElementById('experiment')
    }
  )

  proclaimers.prepare()
  proclaimers.run()

When the sequence is prepared or run, the constituent parts are prepared
and run in sequence.

Options
^^^^^^^

In addition to the default options accepted by the ``BaseElement``, any
sequence accepts two additional options:

``shuffle`` · Run the nested elements in random order (``false``)
  If this option is set to ``true``, the elements in the sequence are shuffled
  during the prepare phase.

``hand_me_downs`` · Options passed to nested elements (``['datastore', 'el']``)
  The options/attributes set in this option are set on nested elements
  during the prepare phase.
  This option is largely for convenience, and designed to decrease the amount
  of repetition when all nested elements behave similarly -- typically, nested
  elements share the same data storage and output element, so these are passed
  on by default.


----

.. [#f1] In apology to our british colleagues: This is, obviously,
  a grossly distorted version of the classic anthem:
  According to XKCD, `the song has 131.9 beats per minute
  <https://what-if.xkcd.com/58/>`_; the appropriate adjustment,
  as well as the Scottish accent, are left as an exercise for our
  esteemed readers.
  We hereby pledge to award special prizes to any colleagues who
  use the library for interdepartmental karaoke.
