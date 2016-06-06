.. _contribute:

Contribute
==========

Thank you for considering contributing to ``lab.js``! Whether you have a
suggestion, if you have spotted a bug or even have a correction handy, whether
you would like to add features or clean up code or documentation, your help is
very welcome indeed.

Please be invited to reach out an discuss any changes you would like to make: We
have a lot of ideas and code lying about, and might be able to give you a head
start. If you are are planning to add significant amounts of additional
functionality, we might ask you to build a plugin instead of including your code
in ``lab.js`` itself. In any case, we are happy to help you getting started!

GitHub Issues provide a public discussion forum for development, which
is where you will get the most help and commentary, but you are welcome to drop
the main contributors a line or two if that is what you prefer.

If you are familiar with Git and GitHub, please feel free to fork the repository
and  submit pull requests; otherwise, your contributions are welcome in any
shape or form.

We expect contributions to conform to the `Developer Certificate of Origin`_. We
encourage contributors to `'sign off' patches`_ as the Linux kernel developers
do.

.. _Developer Certificate of Origin: http://developercertificate.org/
.. _'sign off' patches: http://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/Documentation/SubmittingPatches#n409

----

High-level code overview
------------------------

The source code underlying lab.js is contained in the ``src`` folder of the
repository. For ease of development, the code is split across several files.

``base.js`` · Low-level helpers and event handlers
  This file contains low-level code largely dedicated to handling events both
  from the browser and the library itself. In particular, it defines the
  ``EventHandler`` class, which provides objects with the ability to easily bind
  and remove handlers to DOM as well as internal events. This class is essential
  to the other parts of the library.

  This code is used only within the library, and is not directly exposed to
  users.

``core.js`` · Core user-facing classes
  This code builds upon the ``EventHandler`` class to define the user-facing
  parts of the library, in particular the :js:class:`BaseElement` and its
  derivatives.

  The code in this file is far more straightforward than that in ``base.js``,
  and much more accessible. If you are looking to understand the internals of
  the library, this is the place to start.

``core-display-html.js`` · HTML-based elements
  All elements that use ``HTML`` for showing content: :js:class:`HTMLScreen` and
  :js:class:`FormScreen`.

``core-display-canvas.js`` · Canvas-based elements
  Components in this file rely on the ``Canvas`` for showing content:
  :js:class:`CanvasScreen` and :js:class:`CanvasSequence`.

``core-flow.js`` · Flow control
  These components are not so much for displaying information, but for
  controlling the overall flow of the experiment. In particular, this file
  includes the source for :js:class:`Sequence` and :js:class:`Parallel`.

``data.js`` · Data handling
  The code contained in this file takes care of data storage and export. It
  defines the :js:class:`DataStore` class that logs and formats the experiments'
  output.

----

Building lab.js
---------------

In the repository, only the underlying code is present. To condense all of this
into a single file you can use directly, please follow the following steps.

Compiling a release candidate
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Releases are built using `gulp`_ and several plugins thereof. To produce a
build, you will need a local installation of `node.js`_ and `npm`_. Running

.. code::

  npm install

within the build directory will install all necessary dependencies, whereafter

.. code::

  gulp transpile

will output a transpiled version in the ``build`` directory.

While developing, automatic transpiling when a file has changed is handy.
Running ``gulp watch`` will transpile anew whenever a file is changed. This
is the default action for gulp, so ``gulp`` alone will behave the same.

.. _gulp: http://gulpjs.com/
.. _node.js: https://nodejs.org/
.. _npm: https://www.npmjs.com/

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

The library's documentation is built using `Sphinx`_, which you will need to
`install`_. In addition, you will require the fabulous `Read the Docs Theme`_.

Equipped with both, you can run

.. code::

    make html

in the ``docs`` directory, which will output the html documentation in the
``_build`` subdirectory.

.. _Sphinx: http://sphinx-doc.org/
.. _install: http://sphinx-doc.org/tutorial.html#install-sphinx
.. _Read the Docs Theme: https://github.com/snide/sphinx_rtd_theme
