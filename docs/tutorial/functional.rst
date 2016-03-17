Simplifying code using functions
================================

As you probably noticed in the last section, duplicating and modifying code to
create elements that differ only in details quickly becomes fairly tedious.
There must be a better way! Indeed, there is: Computers are very good at
carrying out simple, repetitive tasks for us. In this section, we will explore
how we can harness [#f1]_ their diligence.

----

Introduction to functions
-------------------------

The base for all our efforts will be **functions**. These are series of steps
that we can teach a computer to perform, similar to a recipe. This means that,
instead of talking through many individual steps every time we need something
done, we can say something like `make me a sandwich <http://xkcd.com/149/>`_,
and the computer will handle the details for us. Other ways of thinking about
functions include magical spells, or very specialized machines that we can
build, that do our bidding at the press of a single button.

Besides reducing the need for repetition, there are several other advantages of
using functions in the code. One related plus is that the code becomes much more
readable and manageable, which is increasingly important as an experiment grows.
This is because functions hide complexity from programmers: Imagine, for
example, the massive complexity of writing text to the browser's console when we
issue an instruction like ``console.log('Hello world')``! There are a lot of
bits being twiddled in the background for this to work, and we don't need to
care about many of them.

<!-- TBC -->

The parentheses at the end of the function call are required, like a magic wand
has to be swished just right for the spell to work. Just saying the word will
not do, which makes things a little harder, but also (in the case of
incantations) prevents unintended catastrophes in latin classes worldwide.

----

.. [#f1] An earlier version of this tutorial read 'take advantage of their
  diligence', but we would never do that, right? The author, for one, welcomes
  his silicon overlords.
