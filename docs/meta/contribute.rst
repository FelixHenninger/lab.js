.. _contribute:

Contribute
==========

**Thank you for considering contributing** to ``lab.js``! Whether you have a suggestion, if you have spotted a bug or even have a correction handy, whether you would like to add new features or documentation or improve what's already there, **your help is very welcome** indeed. Similarly, if you enjoy the project and would like to become a contributor, you are very warmly invited to join; we'd be glad to help you find a contribution that fits your interests and resources.

**Please be invited to reach out and discuss any changes you would like to make**: We have a lot of ideas and code lying about, and might be able to give you a head start. If you are are planning to add significant amounts of additional functionality, we might ask you to build an external add-on or a :ref:`plugin <reference/plugins>` first before including your code in ``lab.js`` itself. In any case, we are happy to help you getting started!

Our `Slack channel`_ is always available for **quick questions** -- we try to be around as much as possible. For long-term **proposals, more formal technical discussions and bug reports**, please use `GitHub issues`_. You are also welcome to drop the main contributors a line or two if you prefer.

If you are familiar with Git and GitHub, please feel free to fork the repository and  submit pull requests; otherwise, **your contributions are welcome in any shape or form**.

We expect contributions to conform to the `Developer Certificate of Origin`_. We encourage contributors to `'sign off' patches`_ as the Linux kernel developers do.

.. _Slack channel: https://slackin-nmbrcrnchrs.herokuapp.com/
.. _GitHub issues: https://github.com/felixhenninger/lab.js/issues
.. _Developer Certificate of Origin: http://developercertificate.org/
.. _'sign off' patches: https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/Documentation/process/submitting-patches.rst#n416

----

High-level code overview
------------------------

Library
^^^^^^^

The source code underlying the ``lab.js`` library is contained in the ``library/src`` folder of the repository. For ease of development, the code is split across several files.

User-facing code
""""""""""""""""

``core.js`` · Core user-facing classes
  This code defines the core user-facing parts of the library, notably the :js:class:`core.Component` and its simplest derivative, the :js:class:`core.Dummy` component.

  If you are looking to understand the internals of the library, this is the place to start -- all the core functionality is defined here. We strive to keep this code especially well-commented and understandable, please do let us know if we can explain something better!

``html.js`` · HTML-based components
  All elements that use ``HTML`` for showing content: :js:class:`html.Screen` and :js:class:`html.Form`.

``canvas.js`` · Canvas-based components
  Components in this file rely on the ``Canvas`` for showing content: :js:class:`canvas.Screen` and :js:class:`canvas.Sequence`.

``flow.js`` · Flow control
  These components are not so much for displaying information, but for controlling the overall flow of the experiment. In particular, this file includes the source for :js:class:`flow.Sequence`, :js:class:`flow.Loop` and :js:class:`flow.Parallel`.

``data.js`` · Data handling
  The code contained in this file takes care of data storage and export. It defines the :js:class:`data.Store` class that logs and formats the experiments' output.

Utilities
"""""""""

The library also contains a range of utility functions and classes for internal use. These are generally not exposed to end-users, but are used extensively throughout the library code.

``util/eventAPI.js`` · Low-level helpers and event handlers
  This file defines the :js:class:`EventHandler` class that provides a very basic `publish-subscribe`_ architecture to all other classes in the library.

  This is really the backbone of the library, which relies heavily on this design for everything that happens. This is the place to dig deepest into the inner machinations of ``lab.js`` .

  .. _publish-subscribe: https://en.wikipedia.org/wiki/Publish–subscribe_pattern

``util/domEvents.js`` · Document event handling
  The code in this file deals with assigning handlers to document events, and establishing and removing the links between both. The resulting :js:class:`DomConnection` class encapsulates this functionality, and is used within each component to handle document events.

Unit tests
""""""""""

The ``test`` directory contains the **automated test suite** that covers most of the library's functionality. This is what allows us to sleep at night, and we highly recommend using it to ensure that any changes you make do not break compatibility. The tests are organized into files depending on the functionality they cover -- these correspond in name to those of the library as described above.

To run the tests, please build the library first (see below) -- the tests will cover your local development copy. You can run the tests by opening the file ``test/index.html`` in your browser. You should (hopefully) see a lot of green tick marks!
Running the tests will also provide you a good indication of whether the library is supported by any particular browser, however be warned that there may be some false negatives (wrongly failing tests) because many tests use EcmaScript 2016 function shorthand which not all browsers support. If this is an issue for you, please contact us for a work-around.

----

Builder
^^^^^^^

The graphical builder interface resides in the repository's ``builder/src`` directory. It is structured as a `React`_ application, building on the `create-react-app`_ template. The internal state is managed using `Redux`_.

``components`` · User interface components
  The application is broken down into distinct components, for example the editor or the sidebar, each of which contain their own logic and styles. If you are looking for a specific part of the user interface to improve, this is where you'll find it.

``logic`` · Application logic
  Besides the user interface, the builder contains a substantial amount of application logic that governs how studies are put together, saved into and loaded from files, and exported to a local preview mode as well as publishable study bundles.

.. _React: https://facebook.github.io/react/
.. _Redux: http://redux.js.org/

----

Building lab.js
---------------

In the repository, only the underlying code is present. To condense all of this into a single file you can use directly to power your studies, please follow the following steps.

Compiling the library
^^^^^^^^^^^^^^^^^^^^^

Releases are built using `npm scripts`_. To produce a build, you will need a local installation of `node.js`_ and `npm`_. Running

.. code::

  npm install

within the build directory will install all necessary dependencies, whereafter

.. code::

  npm run build:js

will output a transpiled version in the ``build`` directory.

.. code::

  npm run build:starterkit

will build the library with all its components (the basic ``HTML`` template, the stylesheet, and several other useful files), and assemble the result into a zip file for easier distribution. This is the bundle that is included with every release.

While developing, automatic transpiling when a file has changed is handy. Running ``npm run watch:js`` will run the transpilation anew whenever a file is changed.

.. _npm scripts: https://docs.npmjs.com/misc/scripts
.. _node.js: https://nodejs.org/
.. _npm: https://www.npmjs.com/

Working on the builder
^^^^^^^^^^^^^^^^^^^^^^

The builder interface is created using Facebook's `create-react-app`_ template, and follows the conventions instituted there. Their documentation provides more information than we ever could.

To summarize just the bare necessities: The main code is found in the ``src`` folder, where the ``components`` subdirectories contain all user-facing interface code, and ``logic`` holds the main application logic.

To install a copy of the builder locally, please download the repository, navigate into the ``builder`` folder, and run ``npm install`` to download all dependencies. Then, typing

.. code::

  npm start

will run the builder application in a **local development server**, and open it in a browser.

.. code::

  npm run build

bundles all files necessary for **deployment**, and creates an optimized version of the application code.

.. _create-react-app: https://github.com/facebookincubator/create-react-app/

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

The library's documentation is built using `Sphinx`_, which you will need to `install`_. In addition, you'll need the fabulous `Read the Docs Theme`_. Equipped with both, you can run

.. code::

  make html


within the ``docs`` folder, which will output the html documentation in the ``docs/_build`` subdirectory.

.. _Sphinx: http://sphinx-doc.org/
.. _install: http://sphinx-doc.org/tutorial.html#install-sphinx
.. _Read the Docs Theme: https://github.com/snide/sphinx_rtd_theme
