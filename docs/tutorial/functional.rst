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
value. If we had a function called ``plusTwo``, typing ``1 + 2`` and
``plusTwo(1)``, and analogously ``let new_number = 1 + 2`` and ``let new_number 
= plusTwo(1)`` are for our purposes entirely equivalent. A function call can act
as a stand-in for an expression that results in the same value, or a variable
name that represents the same value.

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

Defining our own functions
--------------------------

A simple example
^^^^^^^^^^^^^^^^

We just saw that functions can be thought of as miniature machines inside a
program, built to serve a specific purpose, and to encapsulate a more complex
process. Many are offered by the browser itself so that we may use them, they
might be added through the libraries we load on our pages, or we can define our
own.

One of the simplest possible functions can be defined as follows::

  const greetFelix = function() {
    console.log('Hello Felix!')
  }

If you have a browser window handy, please be invited to copy the code into
the browser console! (feel free to substitute your own name)

There are several parts to this **function definition**. The final, and largest
part, located within the curly braces, delimits the **block** of code that
contains the function's inner workings, the recipe that is run when the function
is called. In this case, all our function does is call another function in turn,
writing a greeting on the console. You might recognize this block structure from
other elements of programs, for example ``if`` statements, where blocks of code
are run only if a certain condition is met, or loops, where blocks of code are
run repeatedly. This block of code is preceded by the ``function`` keyword,
which marks it as a function. The very first part represents the assignment of
the function to the ``greetFelix`` variable, allowing us to retrieve the
function at some later point.

If you now call the function using ``greetFelix()`` (typed in the console or as
a line within a larger script), the code contained in the function block will be
executed, and the greeting will be shown.

Using return values
^^^^^^^^^^^^^^^^^^^

In our last example, all our function did was produce a console output as a side
effect. In a way, it acted as a shortcut for another function call. However,
functions are capable of far more, and can substitute not only other function
calls, but also more complex calculations (such as the ``Math.sqrt`` example
above). We can also make use of this in our own functions, using the ``return``
keyword to return a value::

  const makeTwo = function() {
    return 2
  }

A call of this ``makeTwo`` function now produces the integer value ``2``, and
both can be substituted for one another. For example, ``1 + makeTwo()`` would
produce the value three, and ``console.log(2 * makeTwo())`` would output the
number four onto the console.[#f3]_

Of course, this is not a very useful function, because the value it returns
is easier to produce through other means (by writing ``2`` directly); it does
not make our lives easier. However, there are many cases in which long blocks of
code can be substituted by a function call. Take, for example, the humble
fixation cross. It is used often, rarely varies, and therefore a prime candidate
for abstraction using a function::

  const fixationCross = function() {
    return new lab.HTMLScreen(
      '+',
      {
        'timeout': 500
      }
    )
  }

This function, when called, returns an ``HTMLScreen`` containing nothing but a
plus character that, for our purposes, will double as a fixation cross. Like a
call of ``makeTwo`` would provide the number two for further use, a call of
the ``fixationCross`` function provides a fixation cross screen, and accordingly
may be substituted wherever we would otherwise have defined such a screen by
hand.

For example, one might construct a simple experiment as follows::

  const experiment = lab.Sequence([
    // First trial
    fixationCross(),
    // Stimulus 1
    new lab.HTMLScreen(
      'Press A!',
      { // Options
        responses: {
          'keypress(a)': 'correct'
        }
      }
    ),
    // Second trial
    fixationCross(),
    // Stimulus 2
    new lab.HTMLScreen(
      'Press B!',
      { // Options
        responses: {
          'keypress(b)': 'correct'
        }
      }
    ),
    // ...
  ])

  experiment.prepare()
  experiment.run()

Please note how the calls to the ``fixationCross`` function replaces the
otherwise unwieldy and repetitive direct construction of the corresponding
screen. Nice, isn't it?

Adding parameters
^^^^^^^^^^^^^^^^^

Up to now, the functions we have defined always perform the exact same task,
whether producing side effects or returning values. Once defined, they never
wavered in their stoic performance of the recipe they have been programmed to
perform. This would mean that we would have to program a new function for each
set of tasks we would like to encapsulate. If the sets of tasks vary only in
minutiae, this would also quickly become repetitive.

Parameters allow us vary the behavior of a single function across calls, by
specifying the details of its' execution. For example, rather than a ``makeTwo``
function, we might define a ``plusTwo`` function that, as you might imagine,
increments a given value by two. We do so by adding a parameter in the brackets
following the function keyword. In this case, it is called ``x``, but any other
variable name would also be possible. The central trick is that whatever we pass
along as a parameter value will be available within the function block through
this variable, and can be used for our further calculations.::

  const plusTwo = function(x) {
    return x + 2
  }

In this case, the variable ``x`` takes on the value of the parameter passed to
the function, which adds two before returning the result. Thus, ``plusTwo(3)``
would return the value five, and so on.

Again, this is not a particularly useful example, so how can we apply this to
our experiments?

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
.. [#f3] Note that, unlike this example might suggest, return values need not
  be deterministic. For example, the function ``Math.random()`` will return a
  different floating point number between zero and one with each call (well,
  most of the time).
