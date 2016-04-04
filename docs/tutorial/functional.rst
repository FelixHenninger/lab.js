Simplifying code using functions
================================

As you probably noticed in the last section, duplicating and modifying code to
create elements that differ only in details quickly becomes fairly tedious.
There must be a better way! Indeed, there is: Computers are very good at
carrying out simple, repetitive tasks for us. In this section, we will explore
how we can harness [#f1]_ their diligence.

.. contents:: Contents
  :local:

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
using functions in our code. One related plus is that the code becomes much more
readable and manageable, which is increasingly important as an experiment grows.
This is because functions hide complexity from programmers: Imagine, for
example, the massive complexity of writing text to the browser's console when we
issue an instruction like ``console.log('Hello world')``! There are a lot of
bits being twiddled in the background for this to work, and we don't need to
care about almost any of them.

Let's take a closer look at the instruction above. The technical term for it is
a **function call**, in the sense that we call upon a predefined function to do
our bidding. We can separate it into two parts, the one outside and the other
inside the parentheses. The first part is the name of the function, which is
really a variable name under which the function is stored [#f2]_. The second
part are the **arguments**, which are included in the brackets. They further
specify what the function does. You might think of them as knobs on your newly
constructed machine, or the things you point your wand at while you recite your
incantation. The arguments allow you to do similar things in slightly differing
variations using the same function, thus providing some flexibility. In the
above example, the function ``console.log`` can write different pieces of text
to the console depending on the arguments provided, rather than being limited
to a single value.

The **parentheses** at the end of the function call are required, like a magic
wand has to be swished just right for the spell to work. Just saying the word
will not do, which makes things a little harder, but also (in the case of
incantations) prevents unintended catastrophes in latin classes worldwide.

Like a machine might produce, say, pancakes, functions also often **return
values** as results. In doing so, they ideally abstract a more complex operation
and act as a shortcut. Like the pancake machine makes pancakes a matter of
pressing a button, thereby absolving the user of the need to understand its
complex inner workings, a function provides a shorthand for a series of steps or
calculations. We will see how to use this feature in an experiment in a moment,
but as an abstract example for the time being, you might imagine the work
required to make a function call like ``Math.sqrt(9)`` seem effortless. Any
other effects a function might have (besides producing a return value) are
referred to as **side effects**.

As just mentioned, a function call can hide very complex operations from us,
saving us from having to calculate a square root on our own, as in the last
example. Thus, a function can replace any other code by returning an equivalent
value. If we had a function called ``plus_two``, typing ``1 + 2`` and
``plus_two(1)``, and analogously ``let new_number = 1 + 2`` and ``let new_number
 = plus_two(1)`` are for our purposes entirely equivalent. A function call can
act as a stand-in for an expression that results in the same value, or a
variable name that represents the same value.

Where do functions come from? Many, like the above examples, are **built-in**,
and come with the browser. Others are provided by **libraries**, which are
external collections of functions loaded with the page. This latter way is how
``lab.js`` gets loaded onto the web page containing the experiment.
Both methods provide a range of variables representing useful functions. So as
not to use up to many variable names, the functions are often grouped together
using a common 'stem', such as ``Math.`` for many math-related functions,
``console.`` for functions pertaining to console output, and ``lab.`` for
everything provided by the present library.

So now we know how to invoke functions, but we can't rely on other programmers
to supply just the right ones for our purposes. How do we make our own?

----

.. [#f1] An earlier version of this tutorial read 'take advantage of their
  diligence', but we would never do that, right? The author, for one, welcomes
  his silicon overlords.
.. [#f2] You might have noticed that the name, in this case, is also split into
  two parts, separated by the period. This signifies that the ``log`` function
  is part of the ``console`` object. Grouping of functions in objects is often
  used for tidyness -- you might have noticed that all functions belonging to
  ``lab.js`` are contained in the ``lab`` object, as in ``lab.HTMLScreen``.

  Similarly, functions that pertain to a specific element in the experiment are
  also linked to the element's variable with a period, like
  ``experiment.run()``, which runs a specific element. This indicates that the
  function is linked to, and operates on, the object it comes with. Such
  functions are often called **methods**.
