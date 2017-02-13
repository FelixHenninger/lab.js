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
.. _'sign off' patches: https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/Documentation/process/submitting-patches.rst#n416

----

High-level code overview
------------------------

The source code underlying lab.js is contained in the ``src`` folder of the
repository. For ease of development, the code is split across several files.

User-facing code
^^^^^^^^^^^^^^^^

``core.js`` · Core user-facing classes
  This code defines the core user-facing parts of the library, notably the
  :js:class:`core.Component` and its simplest derivative, the
  :js:class:`core.Dummy` component.

  If you are looking to understand the internals of the library, this is the
  place to start -- all the core functionality is defined here. We strive to
  keep this code especially well-commented and understandable, please do let us
  know if we can explain something better!

``html.js`` · HTML-based components
  All elements that use ``HTML`` for showing content: :js:class:`html.Screen`
  and :js:class:`html.Form`.

``canvas.js`` · Canvas-based components
  Components in this file rely on the ``Canvas`` for showing content:
  :js:class:`canvas.Screen` and :js:class:`canvas.Sequence`.

``flow.js`` · Flow control
  These components are not so much for displaying information, but for
  controlling the overall flow of the experiment. In particular, this file
  includes the source for :js:class:`flow.Sequence` and
  :js:class:`flow.Parallel`.

``data.js`` · Data handling
  The code contained in this file takes care of data storage and export. It
  defines the :js:class:`data.Store` class that logs and formats the
  experiments' output.

Utilities
^^^^^^^^^

The library also contains a range of utility functions and classes for internal
use. These are generally not exposed to end-users, but are used extensively
throughout the library code.

``util/eventAPI.js`` · Low-level helpers and event handlers
  This file defines the :js:class:`EventHandler` class that provides a very
  basic `publish-subscribe`_ architecture to all other classes in the library.

  This is really the backbone of the library, which relies heavily on this
  design for everything that happens. This is the place to dig deepest into the
  inner machinations of ``lab.js`` .

  .. _publish-subscribe: https://en.wikipedia.org/wiki/Publish–subscribe_pattern

``util/domEvents.js`` · Document event handling
  The code in this file deals with assigning handlers to document events, and
  establishing and removing the links between both. The resulting
  :js:class:`DomConnection` class encapsulates this functionality, and is used
  within each component to handle document events.

----

Building lab.js
---------------

In the repository, only the underlying code is present. To condense all of this
into a single file you can use directly, please follow the following steps.

Compiling a release candidate
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Releases are built using `npm scripts`_. To produce a build, you will need a
local installation of `node.js`_ and `npm`_. Running

.. code::

  npm install

within the build directory will install all necessary dependencies, whereafter

.. code::

  npm run build:js

will output a transpiled version in the ``build`` directory.

While developing, automatic transpiling when a file has changed is handy.
Running ``npm run watch:js`` will run the transpilation anew whenever a file is
changed.

.. _npm scripts: https://docs.npmjs.com/misc/scripts
.. _node.js: https://nodejs.org/
.. _npm: https://www.npmjs.com/

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

The library's documentation is built using `Sphinx`_, which you will need to
`install`_. In addition, you'll need the fabulous `Read the Docs Theme`_.

Equipped with both, you can run

.. code::

    npm run build:docs

within the repository, which will output the html documentation in the
``docs/_build`` subdirectory.

.. _Sphinx: http://sphinx-doc.org/
.. _install: http://sphinx-doc.org/tutorial.html#install-sphinx
.. _Read the Docs Theme: https://github.com/snide/sphinx_rtd_theme
