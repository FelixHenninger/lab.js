Running tests
=============

Don't be fooled by us listing them last -- **tests are a vital part of our work and infrastructure**. They are what allows us to sleep at night while colleagues the world over rely on our software. When you or any of us proposes a change, automated tests will verify it, and together, we'll write new tests to cover any added functionality.

----

Library
-------

You'll find the **tests for the core library** in the ``packages/library/test`` directory. After building the library, you can test its functionality by opening ``index.html`` in any browser, which will run a series of checks to ensure that everything works as designed. You should (hopefully) see a lot of green tick marks!

During development, you might find it easier and faster to run **automated tests from the command line**. The command ``npm test``, run in the ``packages/library`` folder, will do that for you, provided that you have a version of the chrome browser installed.

To run **cross-browser tests**, you'll need an account at `Sauce Labs`_, and setup your computer so that your login credentials are available. Then, you can run ``npm run test:sauce`` to automatically run the entire test suite across the full range of supported browsers.

We also take great pride in our good **test coverage**, for which statistics can be generated using the command ``npm run test:coverage``.

.. _Sauce Labs: http://saucelabs.com/

----

Builder
-------

Unit tests for the builder cover the core application logic. By running ``npm test`` in the ``packages/builder`` directory, you'll get continuously updated test results.
