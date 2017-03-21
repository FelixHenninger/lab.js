Library core
============

.. _reference/core:

The ``core`` module contains the foundations of the library. As with many types of foundations, you'll probably not see much of this module. However, you'll rely on it with everything you do, and so it's worth getting familiar with the machinations underlying the library, especially if you are looking to extend it.

Because all other components in the library build on the :js:class:`core.Component` class, they share many of the same :js:attr:`options`. This is why we'll often refer to this page when discussing other parts of the library.

.. contents:: Contents
  :local:

----

Component
---------

The :js:class:`core.Component` class is the most basic provided by ``lab.js``. It is the foundation for all other building blocks, which extend and slightly modify it. As per the philosophy of ``lab.js``, experiments are composed entirely out of these components, which provide the structure of the study's code.

In many cases, you will not include a :js:class:`core.Component` directly in your experiment. Instead, your experiment will most likely consist of the other building blocks which ``lab.js`` provides -- but because all of these derive from this fundamental class, there are many similarities: Many components share the same behavior, and accept the same  :js:attr:`options`, so that you will (hopefully) find yourself referring to this part of the documentation from time to time.

Behavior
^^^^^^^^

Following its creation, every component will go through several distinct **stages**.

The **preparation** stage is designed to prepare the component for its later use in the experiment in the best possible way. For example, a display might be prerendered during this phase, and any necessary :js:attr:`media <options.media>` loaded. Importantly, by the time a component is prepared, its settings need to have been finalized.

The **run** stage is the big moment for any component in an experiment. Upon running, the component assumes (some degree of) control over the study: It starts capturing and responding to events triggered by the user, it might display information or stimuli on screen, through sound, or by any other means.

The **end** marks the close of an component's activity. It cedes control over the output, and stops listening to any events emitted by the browser. If there are data to log, they are taken care of after the component's run is complete. Similarly, any housekeeping or cleaning-up is done at this point.

Usage
^^^^^

Instantiation
"""""""""""""

.. js:class:: core.Component([options])

  :param object options: Component options

  The :js:class:`core.Component` does not, by itself, display information or modify the page. However, it can be (and is throughout ``lab.js``) extended to meet even very complex requirements.

  A component is constructed using a set of :js:attr:`options` to govern its behavior, which are specified as name/value pairs in an object. For example, the following component is given a set of :js:attr:`responses <options.responses>` and a :js:attr:`timeout <options.timeout>`::

    const c = new lab.core.Component({
      'responses': {
        'keypress(s)': 'left',
        'keypress(l)': 'right',
      },
      'timeout': 1000,
    })

    c.run()

  These options are available after construction from within the :js:attr:`options` property. For example, the timeout of the above component could be changed later like so::

    c.options.timeout = 2000

  All other options can be modified later using the same mechanism. However, options are assumed to be fixed when a component is prepared.

.. _reference/core/events:

Event API
"""""""""

During a study, a component goes through several distinct stages, specifically ``prepare``, ``run`` and ``end``. Much of the internal logic revolves around these *events*. The most important events are:

* ``prepare``
* ``run``
* ``end``
* ``commit`` (data sent to storage)

External functions can also tie into this logic, for example to collect and transmit data when an experiment (or a part of the same) is over. The following methods make this possible.

.. js:function:: waitFor(event)

  :returns: A `Promise`_ that resolves when a specific event occurs.

  This helper makes it possible to plan actions for a later point during the study, using the `Promise`_ API, as visible in the following example::

    const c = new lab.core.Component({ /* ... */ })

    // Queue a dataset download when the component ends
    c.waitFor('end').then(
      () => c.options.datastore.download()
    )

    // Run the component
    c.run()

  .. _Promise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

.. js:function:: on(event, handler)

  Like the :js:func:`waitFor` helper, this function will trigger an action at a later point. However, instead of a promise, it uses a callback function::

    c.on('end', () => this.options.datastore.download())

  The callback is internally bound to the component, so that the value of ``this`` inside the function corresponds to the component on which the event is triggered.

.. js:function:: once(event, handler)

  Equivalent to :js:func:`on`, but additionally ensures that the handler is only run on the first matching event.

.. js:function:: off(event, handler)

  Remove a previously registered handler for an event.

.. seealso::

  If you want to be notified of *every* event a component goes through, you'll want to look into :ref:`Plugins <reference/plugins>`.

Methods
"""""""

.. js:function:: prepare()

  Trigger the component's prepare phase.

  Make the preparations necessary for :js:func:`run`-ning a component; for example, preload all necessary :js:attr:`media <options.media>` required later.

  The :js:func:`prepare` method can, but need not be called manually: The preparation phase will be executed automatically when the the component is :js:func:`run`. Therefore, it is usually omitted from the examples in the documentation.

  Flow control components such as the :js:class:`Sequence` will automatically prepare all subordinate components unless these are explicitly marked as :js:attr:`tardy <options.tardy>`.

  :returns: A promise that resolves when the preparation is complete (e.g. when all :js:attr:`media <options.media>` have been loaded, etc.)

.. js:function:: run()

  Run the component, giving it control over the participants' screen until the :js:func:`end` method is called. Calling :js:func:`run` will trigger :js:func:`prepare` if the component has not yet been prepared.

  :returns: A promise that resolves when the component has taken control of the display, and all immediate tasks have been completed (i.e. content inserted in the page, requests for rendering on the next animation frame filed)

.. js:function:: respond([response])

  Collect a response and call :js:func:`end`.

  This is a shortcut for the (frequent) cases in which the component ends with the observation of a response. The method will add the contents of the ``response`` argument to the component's :js:attr:`data <options.data>`, evaluate it against the ideal response as specified in :js:attr:`correctResponse <options.correctResponse>`, and then :js:func:`end` the component's run.

  :returns: The return value of the call to :js:func:`end` (see below).

.. js:function:: end([reason])

  End a running component. This causes an component to cede control over the browser, so that it can be passed on to the next component: It stops monitoring :js:attr:`events <options.events>` on the screen, collects all the accumulated :js:attr:`data <options.data>`, commits it to the specified :js:attr:`datastore <options.datastore>`, and performs any additional housekeeping that might be due.

  :returns: A promise that resolves when all necessary cleanup is done: When all data have been logged, all event handlers taken down, etc.

.. js:function:: clone([optionsOverride])

  :returns: A new component of the same type with the same options as the original. If an object with additional :js:attr:`options` is supplied, these override the original settings.

Properties
""""""""""

.. js:attribute:: aggregateParameters

  Superset of the component's :js:attr:`parameters <options.parameters>` and those of any superordinate components (read-only)

  Often, a component's content and behavior is determined not only by its own :js:attr:`parameters <options.parameters>`, but also by those of superordinate components. For example, a component might be contained within a :js:class:`Sequence` representing a block of stimuli of the same type.
  In this and many similar situations, it makes sense to define parameters on superordinate components, which are then applied to all subordinate, nested, components.

  The :js:attr:`aggregateParameters` attribute combines the :js:attr:`parameters <options.parameters>` of any single component with those of superordinate components, if there are any. Within this structure, parameters defined at lower, more specific, levels override those with an otherwise broader scope.

  Consider the following structure::

    const experiment = lab.flow.Sequence({
      'title': 'Superordinate sequence',
      'parameters': {
        'color': 'blue',
        'text': 'green',
      },
      // ... additional options ...
      content: [
        lab.core.Component({
          'title': 'Nested component',
          'parameters': {
            'color': 'red',
          },
        }),
      ],
    })

  In this case, the nested component inherits the parameter ``text`` from the superordinate sequence, but not ``color``, because the value of this parameter is defined anew within the nested component itself.

.. js:attribute:: timer

  Timer for the component (read-only)

  The :js:attr:`timer` attribute provides the central time-keeping instance for the component. Until the component is :js:func:`run`, it will be set to ``undefined``. Then, until the :js:func:`end` of an component's cycle, it will continuously provide the duration (in milliseconds) for which it has been running. Finally, once the cycle has reached its :js:func:`end`, it will provide the time difference between the start and the end of the component's run cycle.

.. js:attribute:: progress

  Progress indicator, as a number between ``0`` and ``1`` (read-only)

  The :js:attr:`progress` attribute indicates whether a component has successfully completed its :js:func:`run`, and (for more complex components) to which degree. For example, a basic :js:class:`html.Screen` will report its progress as either ``0`` or ``1``, depending whether it has completed its turn. Nested components such as the :js:class:`flow.Sequence`, on the other hand, will return a more nuanced value, depending on the status of subordinate components -- specifically, the proportion that has passed at any given time.

----

Options
"""""""

.. js:attribute:: options

The vast majority of customizations are made possible through a component's options, which govern its behavior in detail. In most cases, these options are set when a component is created::

    const c = new lab.core.Component({
      'exampleOption': 'value'
    })

The options can also be retrieved and changed later through the :js:attr:`options` property. For example, the current value of the option created above is available through the variable ``c.options.exampleOption``, and could be changed by altering its content.

Because the presentation of components is prepared when :js:func:`prepare` is called, and the options factor into this step, changes should generally be made before the prepare phase starts (c.f. also the :js:attr:`tardy <options.tardy>` option).

**Basic settings**

.. js:attribute:: options.debug

  Activate debug mode (defaults to ``false``)

  If this option is set, the component provides additional debug information via the browser console.

.. js:attribute:: options.el

  ``HTML`` element within the document into which content is inserted. Defaults to the element with the attribute ``data-labjs-section`` with the value ``main``.

  The :js:attr:`el <options.el>` property determines where in the document the contents of the experiment will be placed. Most parts of an experiment will replace the contents of this element entirely, and substitute their own information.
  For example, an :js:class:`html.Screen` will insert custom ``HTML``, whereas a :js:class:`canvas.Screen` will supply a ``Canvas`` on which information is then drawn.

  To change the location of the content, you can pick out the element of the
  ``HTML`` document where you would like the content placed as follows::

    const c = new lab.core.Component({
      'el': document.getElementById('experiment_content_goes_here'),
      // ... additional options ...
    })

  Selecting a target via ``document.getElementById`` or ``document.querySelector`` requires that the document contains a matching element. For the example above, this would be the following:

  .. code-block:: html

    <div id="experiment_content_goes_here"></div>

**Metadata**

.. js:attribute:: options.title

  Human-readable title for the component, defaults to ``null``

  This is included in any data stored by the component, and can be used to pick out individual components.

.. js:attribute:: options.id

  Machine-readable component identifier (``null``)

  This is often generated automatically; for example, :ref:`flow control components <reference/flow>` will automatically number their nested components when prepared.

.. js:attribute:: options.parameters

  Settings that govern component's behavior ({})

  This object contains any user-specified custom settings that determine a component's content and behavior. These may, for example, be used to fill placeholders in the information presented to participants, as a :js:class:`html.Screen` does.

  The difference between :js:attr:`parameters <options.parameters>` and :js:attr:`data <options.data>` is that the former are retained at all times, while the :js:attr:`data <options.data>` may be reset at some later time if necessary. Thus, any information that is constant and set a priori, but does not change after the component's preparation should be stored in the :js:attr:`parameters <options.data>`, whereas all data collected later should be (and is automatically) collected in the :js:attr:`data <options.data>` attribute.

**Behavior**

.. js:attribute:: options.skip

  End immediately after running (``false``).

.. js:attribute:: options.tardy

  Ignore automated attempts to :js:func:`prepare` the component, defaults to
  ``false``.

  Setting this attribute to ``true`` will mean that the component needs to be prepared manually through a call to :js:func:`prepare`, or (failing this) that it will be prepared immediately before it is :js:func:`run`, at the last minute.

**Response handling**

.. js:attribute:: options.responses

  Map of response events onto response descriptions ({})

  The :js:attr:`responses <options.responses>` object maps the actions a participant might take onto the responses saved in the data. If a response is collected, the :js:func:`end` method is called immediately.

  For example, if the possible responses are to press the keys ``s`` and ``l``, and these map onto the categories *left* and *right*, the response mapping might look as follows::

    'responses':  {
      'keypress(s)': 'left',
      'keypress(l)': 'right',
    }

  The left part, or the keys of this object, defines the **browser event** corresponding to the response. This value follows the `event type syntax <http://www.w3.org/TR/DOM-Level-3-Events/>`_, so that any browser event can be caught. Additional (contrived) examples might be::

    'responses': {
      'keypress(s)': 'The "s" key was pressed',
      'keypress input': 'Participant typed in a form field',
      'click': 'A mouse click was recorded',
      'click button.option_1': 'Participant clicked on option 1',
    }

  As is visible in the first example, additional **options** for each event can be specified in brackets. These are:

  * For ``keypress`` events, the letters corresponding to the desired keys,
    or alternatively ``Space`` and ``Enter`` for the respective keys. Multiple alternate keys can be defined by separating letters with a comma. (for a full list, please consult the `W3C keyboard event specification`_. ``lab.js`` follows this standard where it is available, using only the value ``Space`` instead of a single whitespace for clarity. Note also, however, that some browsers do not fire ``keypress`` events for all keys; specifically, chrome-based browsers do not provide such events for arrow and navigation keys)
  * For ``click`` events, the mouse button used. Buttons are numbered from
    the index finger outwards, i.e. on a right-handed mouse, the leftmost button is ``0``, the middle button is ``1``, and so on, and vice versa for a left-handed mice. (please note that you may also need to catch and handle the ``contextmenu`` event if you would like to stop the menu from appearing when the respective button is pressed.)

  Finally, a **target element** in the page can be specified for every event, as is the case in the last example. The element in question is identified through a CSS selector. If an element is specified in this manner, the response is limited to that element, so a click will only be collected if it hits this specific element, and a keyboard event will only be responded to if the element is selected when the button is pressed (for example if text is input into a form field).

  .. _W3C keyboard event specification: https://www.w3.org/TR/DOM-Level-3-Events-key/#keys-whitespace

.. js:attribute:: options.correctResponse

  Label or description of the correct response (defaults to ``null``)

  The :js:attr:`correctResponse <options.correctResponse>` attribute defines the label of the normative response. For example, in the simple example given above, it could take the values ``'left'`` or ``'right'``, and the corresponding response would be classified as correct.

**Timing**

.. js:attribute:: options.timeout

  Delay between component run and automatic end (null)

  The component automatically ends after the number of milliseconds specified in this option, if it is set.

**Data collection**

.. js:attribute:: options.data

  Additional data (``{}``)

  Any additional data (e.g. regarding the current trial) to be saved alongside automatically generated data entries (e.g. response and response time). This option should be an object, with the desired information in its keys and values.

  Please consult the entry for the :js:attr:`parameters <options.parameters>` for an explanation of the difference between these and :js:attr:`data <options.data>`.

.. js:attribute:: options.datastore

  Store for any generated data (``null`` by default)

  A :js:class:`data.Store` object to handle data collection (and export). If this is not set, the data will not be collected in a central location outside the component itself.

.. js:attribute:: options.datacommit

  Whether to commit data by default (``true``)

  If you would prefer to handle data manually, unset this option to prevent data from being commit when the component ends.

**Preloading media**

.. js:attribute:: options.media

  Media files to preload ({})

  Images and audio files can be preloaded in the background during the prepare phase, to reduce load times later during the experiment. To achieve this, supply an object containing the urls of the files in question, split into images and audio files as follows::

      'media': {
        'images': [
          'https://mydomain.example/experiment/stimulus.png'
        ],
        'audio': [
          'https://mydomain.example/experiment/sound.mp3'
        ]
      }

  Both image and audio arrays are optional, and empty by default.

  Please note that this method has some **limitations**. In particular, the preloading mechanism is dependent upon the browser's file cache, which cannot (yet) be controlled completely. The media file might have been removed from the cache by the time it is needed. Thus, this is a somewhat brittle mechanism which can improve load times, but is, for technical reasons, not guaranteed safe.
  In our experience, testing across several browsers reliably indicates whether preloading is dependable for a given experiment.

  .. caution::
    This is an **experimental feature** and might change at some later point.
    That's because we are still gathering experience with it, and because we foresee that new browser technology may change the implementation.

**Plugins**

.. js:attribute:: options.plugins

  Array of :ref:`plugins <reference/plugins>` that interact with the component, and are automatically notified of :ref:`events <reference/core/events>`. For example, adding a :js:class:`plugins.Logger` instance will log event notifications onto the console::

    const c = new lab.core.Component({
      plugins: [
        new lab.plugins.Logger(),
      ],
    })

  Similarly, :js:class:`plugins.Debug` provides the interface for data checking and debugging used in the builder preview.

**Advanced options**

.. js:attribute:: options.events

  Map of additional event handlers (``{}``)

  In many experiments, the only events that need to be handled are responses, which can be defined using the :js:attr:`responses` option described above. However, some studies may require additional handling of events before a final response is collected. In these cases, the events object offers an alternative.

  The events option follows the same format used for the responses, as outlined above. However, instead of a string response, the object values on the right-hand side are event handler functions, which are called whenever the specified event occurs. The functions are expected to receive the event in question as an argument, and process it as they see fit. They are automatically bound to the component in question, which is available within the function through the ``this`` keyword.

  As a very basic example, one might want to ask users not to change to other windows during the experiment::

    'events': {
      'visibilitychange': function(event) {
        if (document.hidden) {
          alert(`Please don't change windows while the experiment is running`)
        }
      },
    }

.. js:attribute:: options.messageHandlers

  Map of internal component events to handler functions (``{}``)

  This is a shorthand for the :js:func:`on` method ::

    const c = new lab.core.Component({
      messageHandlers: {
        'run': () => console.log('Component running'),
        'end': () => console.log('Component ended'),
      }
    })

  .. caution::

    This option is **likely to be renamed** at some later point; we are not happy with its current label. Ideas are very welcome!


----

Dummy
-----

The :js:class:`core.Dummy` component is a stand-in component that calls :js:func:`end` immediately when the component is run. We use it for tests and demonstrations, and only very rarely in experiments.

.. js:class:: core.Dummy([options])

  Direct descendant of the :js:class:`core.Component` class, with the single difference that the :js:attr:`skip <options.skip>` option is set to ``true`` by default.
