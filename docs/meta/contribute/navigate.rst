Finding your way around the code
================================

If you look into the library code, you'll find annotations and explanations alongside the JavaScript source. However, it can be difficult to find the place you're looking for. The following page is meant as an overview; if you have any further questions, do let us know.

----

Library
-------

The source code underlying the ``lab.js`` library is contained in the ``packages/library/src`` folder of the repository. For ease of development, the code is split across several files.

User-facing code
^^^^^^^^^^^^^^^^

``core.js`` · Core user-facing classes
  This code defines the core user-facing parts of the library, notably the :js:class:`core.Component` and its simplest derivative, the :js:class:`core.Dummy` component.

  If you are looking to understand the internals of the library, this is the place to start -- all the core functionality is defined here. We strive to keep this code especially well-commented and understandable, please do let us know if we can explain something better!

``html.js`` · HTML-based components
  All elements that use ``HTML`` for showing content: :js:class:`html.Screen`, :js:class:`html.Form` and :js:class:`html.Frame`. These are probably most commonly used in studies.

``canvas.js`` · Canvas-based components
  Components in this file rely on the ``Canvas`` for showing content, for extra performance: :js:class:`canvas.Screen`, :js:class:`canvas.Sequence` and :js:class:`canvas.Frame`.

``flow.js`` · Flow control
  These components are not so much for displaying information, but for controlling the overall flow of the experiment. In particular, this file includes the source for :js:class:`flow.Sequence`, :js:class:`flow.Loop` and :js:class:`flow.Parallel`.

``data.js`` · Data handling
  The code contained in this file takes care of data storage and export. It defines the :js:class:`data.Store` class that logs and formats the experiments' output.

Utilities
^^^^^^^^^

The library also contains a range of utility functions and classes for internal use. These are generally not exposed to end-users, but are used extensively throughout the library code.

``util/eventAPI.js`` · Low-level helpers and event handlers
  This file defines the :js:class:`EventHandler` class that provides a very basic `publish-subscribe`_ architecture to all other classes in the library.

  This is really the backbone of the library, which relies heavily on this design for everything that happens. This is the place to dig deepest into the inner machinations of ``lab.js`` .

  .. _publish-subscribe: https://en.wikipedia.org/wiki/Publish–subscribe_pattern

``util/domEvents.js`` · Document event handling
  The code in this file deals with assigning handlers to document events, and establishing and removing the links between both. The resulting :js:class:`DomConnection` class encapsulates this functionality, and is used within each component to handle document events.

``util/fromObject.js`` · Construct studies from serialized representations
  Many of the studies built with ``lab.js`` -- for example those constructed using the builder, aren't programmed in JavaScript code directly. Instead, users provide a static representation of their study, and rely on the library to assemble the appropriate code. This is what the code in this file is for.

``util/fullscreen.js`` · Fullscreen helpers
  This file provides functions to enter and leave fullscreen mode across all browsers.

``util/options.js`` · Option parsing
  The code in this file helps with substituting component :js:attr:`parameters <options.parameters>` in the content and options of components.

``util/preload.js`` · Media preloading
  Preloading images and other static assets.

``util/random.js`` · Random number generation
  Anything that needs to be sampled, drawn, suffled or generated randomly goes through this code.

``util/tree.js`` · Tree traversal
  A more complex study built with ``lab.js`` will often resemble a tree structure, in that there is a central :js:class:`sequence <flow.Sequence>` as a stem, which contains other components. These child components may, in turn, contain others nested inside them. This nested, or tree-like structure, frequently needs to be navigated, and the utilities in this file help with that.

----

Builder
-------

The graphical builder interface resides in the repository's ``builder/src`` directory. It is structured as a `React`_ application, building on the `create-react-app`_ template. The internal state is managed using `Redux`_.

``components`` · User interface components
  The application is broken down into distinct components, for example the editor or the sidebar, each of which contain their own logic and styles. If you are looking for a specific part of the user interface to improve, this is where you'll find it.

``logic`` · Application logic
  Besides the user interface, the builder contains a substantial amount of application logic that governs how studies are put together, saved into and loaded from files, and exported to a local preview mode as well as publishable study bundles.

.. _React: https://facebook.github.io/react/
.. _Redux: http://redux.js.org/
.. _create-react-app: https://github.com/facebookincubator/create-react-app/
