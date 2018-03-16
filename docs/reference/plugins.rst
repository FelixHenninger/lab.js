.. _reference/plugins:

Plugins
=======

The components that ``lab.js`` provides differ with regard to their behavior during a study -- some might be responsable for :ref:`presenting information to participants <reference/html>`, others might be in charge of the :ref:`overall study flow <reference/flow>`.

It is, however, sometimes desirable to provide functionality that can be combined with any type of component, regardless of the specific type and stimulus modality it represents. This is what **plugins** are for.

----

Overview and motivation
-----------------------

Plugins hook into any component, and are then notified of :ref:`events <reference/core/events>` on that component. They are then free to react to each of these events in any way.

For example, it might be helpful to create a plugin that ensures that part of the study is presented in fullscreen mode -- part being be a single :js:class:`html.Screen` or :js:class:`html.Form`, or a larger chunk of the experiment, as represented by a :js:class:`flow.Sequence` or :js:class:`flow.Loop`. In each case, such a plugin would ensure that the fullscreen mode is entered at the beginning of its activity, that the standard display is restored afterwards, and it would respond gracefully if the user exits the fullscreen view.

The advantage of this setup is that similar functionality (in this case, fullscreen handling) need not be implemented anew with every component. It thereby reduces the need for specialized components that cover any possible combination of functionality, such as a (hypothetical) ``flow.FullscreenSequence`` or the like. Similarly, plugins can be used to pull out functionality that is not universally used, and would add complexity to the :js:class:`core.Component`. Thus, plugins serve to reduce the bulk of the library code, and offer a flexible method of implementing custom functionality with the existing components.

----

Usage
-----

Any number of plugins can be added to a component upon initialization via the :js:attr:`plugins <options.plugins>` option::

  const c = new lab.core.Component({
    plugins: [
      new lab.plugins.Logger(),
    ]
  })

After construction, plugins can be added using the commands ``c.plugins.add()`` and ``c.plugins.remove()``.

.. caution::

  This API (plugin addition and removal after construction) is tentative and may change as the library evolves.

----

Built-in plugins
----------------

.. js:class:: plugins.Logger([options])

  This basic plugin outputs any events triggered on a specific component to the browser console. It accepts a single option, a ``title`` that is output with every debug message.

.. js:class:: plugins.Debug()

  This plugin provides a debug overlay for any study, specifically a real-time view of the study state and the collected data. It is added in the builder preview to provide a means of checking the data.

.. js:class:: plugins.Metadata()

  Collects technical metadata regarding the user's browser and saves it in the ``meta`` column. The data is ``JSON``-encoded and contains the following keys:

  * ``location``: ``URL`` under which the study was accessed
  * ``userAgent``: Browser identification
  * ``platform``: Operating system, if provided by the browser
  * ``language``: Browser language preferences, e.g. ``en-US``
  * ``locale``: Active browser locale, e.g. ``en-UK``
  * ``timeZone``: User time zone, e.g. ``Europe/Berlin``
  * ``timezoneOffset``: Offset from local time to ``UTC``, in minutes, e.g. ``-60``
  * ``screen_width`` and ``screen_height``: Monitor resolution
  * ``scroll_width`` and ``scroll_height``: Size of the window content (in pixels)
  * ``window_innerWidth`` and ``window_innerHeight``: Size of the browser viewport, that is, the portion of the page that is visible
  * ``devicePixelRatio``: Scaling factor that maps virtual onto physical pixels, for example on high-resolution screens or when the page zoom level is changed. This affects most of the screen measurements reported above, which are in virtual pixels. To convert to physical pixels, multiply the values by this scaling ratio.

.. js:class:: plugins.Transmit([options])

  Transmits collected data over the course of the study. Whenever new data are :js:func:`committed <commit>`, all changed columns are :js:func:`transmit` to a ``url`` supplied in the options (required), along with any ``metadata``, which can be specified in the options as an object (optionally). At the :js:func:`end` of the component, the entire dataset is saved in the same way.

----

User-defined plugins
--------------------

Users can define their own plugins to provide custom functionality. Plugins are JavaScript objects that are defined by one commonality only: They provide a ``handle`` method that his called whenever an event is triggered on the associated component. The method receives two parameters, the ``context`` which represents the component on which the event was triggered, and the ``event``, a string representing the type of event (e.g. ``prepare``, ``run`` etc.).

In addition to the component event, the handle method will be called with the ``plugin:init`` event when the plugin is added to the component, and ``plugin:removal`` when the plugin is removed. It is the responsability of the plug-in to take care of all intervening coordination with the document and the linked component.

As an example, consider the :js:class:`plugins.Logger`, shown here in its entirety::

  class Logger {
    constructor(options) {
      this.title = options.title
    }

    handle(context, event) {
      console.log(`Component ${ this.title } received ${ event }`)
    }
  }

.. caution::

  As with the above API, some details of the custom plugin messages might be subject to changes. In particular, the ``plugin:removal`` event might be renamed.
