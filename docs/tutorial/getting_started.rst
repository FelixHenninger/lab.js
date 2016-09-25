Getting Started
===============

Thank you so much for checking out ``lab.js``! It's a great pleasure to have you
here, and we hope you will enjoy building experiments using this little library
as much as we have enjoyed building it.

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
helps you get to speed quickest -- you are by no means limited to the provided
template.

A first look at ``lab.js``
--------------------------

Among the extracted files, you should find a file named ``index.html`` [#f1]_ .
This is the web page that contains the initial demo experiment. Please open this
file in a browser, by double-clicking the file or dragging it onto your browser
window.

The page should look very similar to the following example, but please don't
anxiously wait for something to happen: it won't. That's because right now,
there is no experiment to run. That's for us to finish, and it's what we'll do
in the next step.

.. image:: getting_started/starterkit.png
   :alt: Screenshot of default starterkit page

Before we move on, you might want to have a brief look at the code of the file
you just viewed. If you open it in your editor instead of the browser, you'll
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

With that, let's go build an experiment!

Getting the experiment to run
-----------------------------

----

.. [#f1] Traditionally, the *landing page* visitors see first when navigating to
  a web page is called ``index.html``. It is solely out of convention that this
  naming scheme has been adopted here, you are welcome to change it!
