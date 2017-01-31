Roadmap
=======

----

Release schedule
----------------

The library aims for biannual major releases in a tick-tock pattern. The
summer release will be allowed to break backward compatibility if necessary,
but the API should remain stable for the remainder of the year, though features
may be added. This very similar to the concept of `semantic versioning
<http://semver.org/>`_.

----

.. _philosophy:

Philosophy and Scope
--------------------

Many small decisions have to be made when building a library like this, and from
time to time, on idle evenings, the urge makes itself noticed to imagine that
some grand underlying principles governed its design. At other times, when
thoughts go in circles over some minute detail, obsessing over some minor
detail, one dreams of some guidelines that might inform API structure.

This section is an attempt at distilling principles for the design of the
library, to serve as a benchmark and discussion tool for the interested, and for
its developers. It is the result of both pathological grandiosity and
rumination, and should not be taken too seriously: Pragmatism will always
dominate the following ideas, and quite likely they will have to revised sooner
or later, when we discover that our thinking has changed.

Built as a tool for teaching
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``lab.js`` is built for researchers with broad experience in programming
experiments as much as it is built for novices to programming. This necessitates
maximum possible conceptual clarity. Interfaces and terminology should be as
consistent as possible throughout the library.

The original author's courses in experimental design and programming are half
practical, geared toward enabling students to build and run experiments,
and half technical, intended to convey at least the most basic programming
concepts. Therefore, the library should be representative of general programming
practices, and avoid custom notation that might seem simpler at first, but
would limit generalizability of the acquired knowledge.

Limited in scope
^^^^^^^^^^^^^^^^

The central technical goal of the library is to provide a framework for handling
the temporal progression of events over the course of a computer-based
experiment that is run in the browser as a single-page application. It also
offers helpers for working with the collected data.

The generation and sequencing of stimuli themselves should be left to the user,
or external libraries. A ``GaborScreen``, or anything similarly specific, would
be out of scope, and should be provided as a third-party-addon.

That being said, the project's design should make possible the reuse and sharing
of parts of studies, so that they can be easily incorporated into new research.

Based on web standards
^^^^^^^^^^^^^^^^^^^^^^

Technical decisions are made on the assumption that the era of great differences
between web browsers is over, and that future browsers will be updated at a
steady pace to follow common standards. Antiquated browsers should not be a
reason to compromise on features or performance. At the same time, I have been
reluctant to incorporate experimental features unique to any particular browser.
