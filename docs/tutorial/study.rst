Building a working study
========================

.. note::
  **This documentation page is currently under development. Sorry for that!**

  We're actively working on this, so there might be parts that are missing or
  incomplete. Please be invited to start with the tutorial nonetheless,
  the additional parts are coming very soon.

  If you find something awry or missing content, please don't hesitate to send
  us a line or two, we're happy to explain things further or to give you a
  personal tutorial via Skype/Hangouts/etc. or in person.

  Sorry for the trouble!

.. raw:: html

  <style>
    .blue {
      color: blue;
      font-weight: 600;
    }
    .document img {
      margin-bottom: 5px;
      border: 1px solid #e1e4e5;
      border-radius: 5px;
    }
  </style>

.. role:: blue

.. image:: study/1-stroop-incongruent.png
   :alt: Stroop task screenshot
   :width: 45%
   :align: right

**This is where we build our first working study!** Specifically, we're going to
create an experiment that demonstrates the *Stroop effect*. This effect
describes the interference between a written word's content and its visual
characteristics: `John Ridley Stroop <https://en.wikipedia.org/wiki/John_Ridley_Stroop>`_
demonstrated that naming the color of a word is harder (takes longer) when the
word denotes a different color. An example for such an *incongruent* display
might be the word :blue:`red`. Conversely, in the word and color can correspond
(be *congruent*), which makes the task easier.

Picking back up
---------------

This section builds on the previous one, in which you `downloaded the starter
kit <https://github.com/FelixHenninger/lab.js/releases>`_ and took at first look
how a minimal 'experiment' was constructed from individual components. You also
made the code run by adding or uncommenting ``experiment.run()``. We'll build
upon the same code, so please make sure you have the files and an editor handy.

If didn't go through the initial steps and don't feel confident looking at the
starter kit code, please go back and take a quick look. You're always welcome to
`reach out if you need help <https://github.com/FelixHenninger/lab.js#find-help>`_
right now or in any of the following steps.

With that, let's get going!
