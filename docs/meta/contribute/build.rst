Building a local copy
=====================

The project repository contains the code underlying the ``lab.js`` library and the builder interface. To condense both into a single library file for distribution with studies, and an uploadable version of the builder, please follow these additional steps after downloading. You'll need a local installation of `node.js`_ and `npm`_.

You'll notice that many of the commands start with ``npm`` -- that's because we use `npm scripts`_ as shortcuts for most build steps.

----

Downloading the code
--------------------

The easiest way to create a local copy is by cloning the repository. If you use `git`_, you can copy the following command:

.. code::

  git clone https://github.com/FelixHenninger/lab.js.git

If you'd prefer a `direct download`_, that's available too!

.. _git: https://git-scm.com/
.. _direct download: https://github.com/FelixHenninger/lab.js/archive/master.zip

----

Bootstrapping the project
-------------------------

The library and builder interface are contained in the same repository because they share several pieces of code. Both are coordinated by `Lerna`_, which can initialize all parts at once by running the following commands in the project directory:

.. code::

  npm install && npm run bootstrap

.. _Lerna: https://lernajs.io/

----

Compiling the library
---------------------

Changing to the ``packages/library`` directory and running

.. code::

  npm install

will install all dependencies for the ``lab.js`` library, whereafter

.. code::

  npm run build:js

will output a transpiled version in the ``packages/library/build`` directory. If you would like the transpiled output to be updated automatically as you make changes, ``npm run watch:js`` will do that for you.

.. code::

  npm run build:starterkit

will build the library with all its components (the basic ``HTML`` template, the stylesheet, and several other useful files), and assemble the result into a ``zip`` file for easier distribution. This is the bundle that is included with every release.

There are a few more commands available, which you can see by typing ``npm run`` in the ``packages/library`` folder.

.. _npm scripts: https://docs.npmjs.com/misc/scripts
.. _node.js: https://nodejs.org/
.. _npm: https://www.npmjs.com/

----

Working on the builder
----------------------

The builder interface is created using Facebook's `create-react-app`_ template, and follows the conventions instituted there. If you're looking for details, their documentation provides more information than we ever could.

The main code is found in the ``packages/builder/src`` folder, where the ``components`` subdirectories contain all user-facing interface code, and ``logic`` holds the main application logic.

To install a copy of the builder locally, please download the repository, navigate into the ``packages/builder`` folder, and run ``npm install`` to download all dependencies. Then, typing

.. code::

  npm start

will run the builder application in a **local development server**, and open it in a browser.

.. code::

  npm run build

bundles all files necessary for **deployment**, and creates an optimized version of the application code in the ``packages/builder/build`` folder for you to upload to a local server.

.. important::
   For the ``lab.js`` builder to work on a public server, it must be served over an encrypted connection (via `HTTPS`_); please make sure that encryption is set up on the server you're using.

.. _create-react-app: https://github.com/facebookincubator/create-react-app/
.. _HTTPS: https://en.wikipedia.org/wiki/HTTPS

----

Building the documentation
--------------------------

The library's documentation is built using `Sphinx`_, using the fabulous `Read the Docs Theme`_. Both require a local ``python`` installation, as well as the ``pip`` package manager.

If you don't have ``python`` on your system, please consider the `Anaconda python distribution <https://www.anaconda.com/download/>`_; if you're only missing ``pip``, you can `install it <https://pip.pypa.io/en/stable/installing/>`_ on your system. Equipped with both, install the required Python modules:

.. code-block:: bash

  pip install -r docs/requirements.txt

With everything at hand, you can run the following command from the project's root directory:

.. code-block:: bash

  npm run build:docs

This will output the html documentation in the ``docs/_build`` subdirectory. Running ``npm run watch:docs`` will update the documentation whenever you save changes.

.. _Sphinx: http://sphinx-doc.org/
.. _install: http://sphinx-doc.org/tutorial.html#install-sphinx
.. _Read the Docs Theme: https://github.com/snide/sphinx_rtd_theme
