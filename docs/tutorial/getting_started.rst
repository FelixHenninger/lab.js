Getting Started
===============

**Thank you so much for checking out lab.js!** It's a great pleasure to have you
here, and we hope you will enjoy building experiments using this little library
as much as we have enjoyed creating it.

The purpose of this initial tutorial is to get you up to speed as quickly as
possible. We'll have you building a simple experiment in the next half hour or
so, and we'll examine more details in the following parts of the tutorial.

You'll need a browser, and a basic understanding of how web pages are built
using ``HTML``. In addition, a good text editor with syntax highlighting can be
an enormous support: It helps us distinguish the different parts of our code
visually. If you're using a text editor already in your daily work, stick to
that. If you haven't used a text editor before, we would encourage you to try
out `Atom <https://atom.io/>`_, which works great out of the box.

If you run into difficulties in the tutorial, that's our fault. Please let us
know how we can support you. We are also constantly trying to make the tutorial
clearer and more helpful -- if you have comments or suggestions, we would love
to hear them!

.. contents:: Contents
  :local:

.. raw:: html

  <style type="text/css">
    .document img {
      margin-bottom: 5px;
      border: 1px solid #e1e4e5;
      border-radius: 5px;
    }
  </style>

----

Downloading the starter kit
---------------------------

To get up and running, the first thing you'll need to do is download the starter
kit attached to `the latest release <https://github.com/FelixHenninger/lab.js/releases>`_
of ``lab.js``.

The starter kit is a zip archive containing all necessary files for building a
simple experiment. Please extract it in a convenient location on your computer,
and navigate to the folder containing the extracted files. That's it!

Whenever you are building a new experiment in the future, you can start from a
clean slate by downloading and building upon the latest starter kit. As you
gather more experience, you might build your own starter kit using the code that
helps you get to speed quickest -- you are by no means limited to the template
provided.

A web page about to be turned into an experiment
------------------------------------------------

Among the extracted files, you'll find a file named ``index.html`` [#f1]_ . This
is the web page that contains the initial experiment. Please open this file in a
browser, by double-clicking the file or dragging it onto your browser window.

.. image:: getting_started/starterkit.png
   :alt: Screenshot of default starterkit page
   :width: 60%
   :align: right

The page should look very similar to the example on the right, but please don't
anxiously wait for something to happen: it won't. That's because right now,
there is no experiment to run -- the file we opened just contains the loading
screen. The experiment we build will replace this content, as we will see in the
next step.

Before we move on, you might want to have a brief look at the code of the file
you just opened. If you view it in your editor instead of the browser, you'll
see the underlying source code. If you like, take a closer look -- here are some
things you might notice:

* In the ``head`` tag, there are quite a few references to outside files. In
  particular, we're loading some external Javascript and ``CSS``. These are
  provided with ``lab.js`` and contain the library code and default styles. You
  might have also spotted a reference to ``experiment.js`` -- that's where we'll
  define the actual study.
* The ``body`` tag contains the page content. A closer look will reveal that
  everything is contained within a ``div`` tag of the ``container`` class.
  This is what provides the rectangular frame you saw on the page.
* Within the container div, the content is subdivided into ``header``, ``main``,
  and ``footer`` elements. These correspond to the three areas on the page. Feel
  free to adjust the content as you see fit!
* Finally, inside the ``main`` element, there's a ``div`` with an ``id`` of
  ``labjs-content``. That's where the actual experimental content will go.

With that, let's go get this experiment to work!

.. seealso::

  If you're not quite sure exactly how the design works, please don't worry --
  we'll come back to the specifics of layout when we think about :ref:`styling
  your study <tutorial/style>`

How an experiment is built
--------------------------

The experiment runs on top of the basic ``HTML`` file you've just seen, by
exchanging content when appropriate, and collecting and reacting to
participants' responses. This interaction requires Javascript.

Let's take a closer look at the ``experiment.js`` file included in the starter
kit -- that's where the actual structure of the experiment is set up. In
particular, let us draw your attention to a specific part of the code::

  var experiment = new lab.flow.Sequence({
    content: [
      /* ... */
    ]
  })

As you may have guessed, this snippet defines the experiment as a **sequence**
of things. To be exact, the sequence component is retrieved from the ``flow``
control part of the ``lab`` library. Then, a new sequence is created and saved
in the ``experiment`` variable. Some additional options are provided in the
brackets, notably some ``content`` (omitted here). You might have noticed that
the content is included in brackets, which indicate a list of things (or, to use
the common technical term, an array).

So what goes into the sequence content? Again, there's an example in the starter
kit::

  new lab.html.Screen({
    content: 'Hello world!'
  })

We hope that the similarities to the previous example become apparent: We're
building a new screen which is provided by the ``HTML`` part of the library.
Again, there's some content, this time a text string, which is more appropriate
as content for a single screen than the list of things used in the sequence
above.

This basic structure is worth taking another look at, because we're going to
come across it over and over again: We're going to build components, specify
some content (and possibly a few more options), and nest them within one another
to build even complex experiments.

So why isn't this working yet?
------------------------------

We apologize for keeping you in suspense for this long! If you take another look
at the remainder of the code in the file, two more things happen: A :ref:`data
store <reference/data>` is set up to collect the information gathered in the
experiment, and then the experiment is run ... or rather it isn't, because us
spoilsports have commented out the final line of code.

By uncommenting the final line and reloading the ``HTML`` page in the browser,
you should see the code in action: Instead of the loading screen you saw before,
the page should now contain the content you specified above.

Feel free to change the content to see that your changes to the code are
reflected in the display. You might also try adding a second screen to the
sequence -- make sure that you don't forget a comma to separate the two as you
list them in the sequence content. Also, you might need to add an additional
option like ``timeout: 1000`` to the first screen to make sure that the
experiment progresses beyond it!

.. tip::

  Please don't worry about breaking the code: It can't harm your computer.
  If something goes wrong, you can find the original version `in the repository
  <https://github.com/FelixHenninger/lab.js/blob/master/src/starterkit/experiment.js>`_.

  If you have questions at this point, please don't hesitate to reach out; we'd
  be thrilled to hear from you and happy to help as best we can.

----

Where to go from here
---------------------

In this section, we hope that you've gained some familiarity with the starter
kit, that you've seen that experiments in ``lab.js`` operate by **exchanging
page content**, and that experiments consist of **components** with a regular
structure, and that can be **nested** to create even complex experiments.

As a next step, we'll build upon your new knowledge and create more useful
experiments using the exact same technique. **We hope you'll join us!**

----

.. [#f1] Traditionally, the *landing page* visitors see first when navigating to
  a web page is called ``index.html``. It is solely out of convention that this
  naming scheme has been adopted here, you are welcome to change it!
