Library core
============

.. _reference/core:

The ``core`` module contains the foundations of the library. As with many types
of foundations, you'll probably not see much of this module. However, you'll
rely on it with everything you do, and so it's worth getting familiar with the
machinations underlying the library, especially if you are looking to extend it.

.. contents:: Contents
  :local:

----

Component
---------

The :js:class:`core.Component` class is the most basic provided by lab.js . It
is the foundation for all other building blocks, which extend and slightly
modify this basic class. As per the philosophy of lab.js, experiments are
composed entirely out of these components, which provide the structure of the
study's code.

In many cases, you will not include a :js:class:`core.Component` directly in your
experiment. Instead, your experiment will most likely consist of the other
building blocks which lab.js provides, all of which derive from this fundamental
class.

Because all other components provided by the library are derived from the
:js:class:`core.Component`, they share the same behavior, and accept the same
options, so that you will (hopefully) find yourself referring to this part of
the documentation from time to time.

Behavior
^^^^^^^^

Following its creation, a component will go through several distinct **stages**.

The **preparation** stage is designed to prepare the component for its later
use in the experiment in the best possible way. For example, a display might be
prerendered during this phase, and any necessary assets loaded. Importantly,
by the time a component is prepared, its settings have to have been finalized.

The **run** stage is the big moment for any component in an experiment. Upon
running, the component assumes (some degree of) control over the study: It
starts capturing and responding to events triggered by the user, it might
display information or stimuli on screen, through sound, or by any other means.

The **end** marks the close of an component's activity. It cedes control over
the output, and stops listening to any events emitted by the browser. If there
are data to log, it is taken care of after the component's run is complete.
Similarly, any housekeeping or cleaning-up is done at this point.


Usage
^^^^^

.. js:class:: core.Component([options])

  The :js:class:`core.Component` does not, by itself, display information or
  modify the page. However, it can be (and is throughout lab.js) extended to
  meet even very complex requirements.

  A component is constructed using a set of options to govern its behavior,
  which are defined in an object ::

    var c = new lab.core.Component({
      'responses': {
        'keypress(s)': 'left',
        'keypress(l)': 'right'
      },
      'timeout': 1000
    })

    c.run()

  **Actions**

  .. js:function:: prepare()

    Trigger the component's prepare phase.

    Make the preparations necessary for :js:func:`run`-ning a component; for
    example, preload all necessary :js:attr:`media` required later.

    The :js:func:`prepare` method can, but need not be called manually: The
    preparation phase will be executed automatically when the the component is
    :js:func:`run`. Therefore, it is usually omitted from the examples in the
    documentation.

    Flow control components such as the :js:class:`Sequence` will automatically
    prepare all subordinate components unless these are explicitly marked as
    :js:attr:`tardy`.

    :returns: A promise that resolves when the preparation is complete (e.g.
      when all :js:attr:`media` have been loaded, etc.)

  .. js:function:: run()

    Run the component, giving it control over the participants' screen until the
    :js:func:`end` method is called. Calling :js:func:`run` will trigger
    :js:func:`prepare` if it has not already run.

    :returns: A promise that resolves when :js:func:`end` is called on the
      component.

  .. js:function:: respond([response])

    Collect a response and call :js:func:`end`.

    This is a shortcut for the (frequent) cases in which the component ends with
    the observation of a response. The method will add the contents of the
    ``response`` argument to the component's :js:attr:`data`, evaluate it
    against the ideal response as specified in :js:attr:`correctResponse`, and
    then :js:func:`end` the component's run.

  .. js:function:: end([reason])

    End a running component. This causes an component to cede control over the
    browser, so that it can be passed on to the next component: It no longer
    monitors :js:attr:`events` on the screen, collects all the accumulated
    :js:attr:`data`, commits it to the specified :js:attr:`datastore`, and
    performs any housekeeping that might be due.

  .. js:attribute:: tardy

    Ignore automated attempts to :js:func:`prepare` the component, defaults to
    ``false``.

    Setting this attribute to ``true`` will mean that the component needs to be
    prepared manually through a call to :js:func:`prepare`, or (failing this)
    that it will be prepared immediately before it is :js:func:`run`, at the
    last minute.

  **Basic settings**

  .. js:attribute:: debug

    Activate debug mode (defaults to ``false``)

    If this option is set, the component provides additional debug information
    via the browser console.

  .. js:attribute:: el

    ``HTML`` element within the document that will hold content. Defaults to the
    element with the id ``labjs-content``.

    The :js:attr:`el` property determines where in the document the contents of
    the experiment will be placed. Most parts of an experiment will replace
    the contents of this element entirely, and substitute their own information.
    For example, an :js:class:`html.Screen` will insert custom ``HTML``, whereas
    a :js:class:`canvas.Screen` will supply a ``Canvas`` on which information is
    then drawn.

    To change the location of the content, you can pick out the element of the
    ``HTML`` document where you would like the content placed as follows::

      const b = new lab.core.Component({
        el: document.getElementById('experiment_content_goes_here')
        // ... additional options ...
      })

    This assumes that the ``HTML`` document that contains the experiment
    includes an element hat meets this criterion, for example the following:

    .. code-block:: html

      <div id="experiment_content_goes_here"></div>

  **Metadata**

  .. js:attribute:: title

    Human-readable title for the component, defaults to ``null``

    This is included in any data stored by the component, and can be used to
    pick out individual components.

  .. js:attribute:: id

    Machine-readable component identifier (``null``)

    Sequences will automatically number contained components when prepared.

  .. js:attribute:: parameters

    Settings that govern the display of the component ({})

    This object contains any user-specified custom settings that determine a
    component's content. These may, for example, be used to fill placeholders
    in the information presented to participants, as a :js:class:`html.Screen`
    does.

    The difference between :js:attr:`parameters` and :js:attr:`data` is that the
    former are retained at all times, while the :js:attr:`data` may be reset at
    some later time if necessary. Thus, any information that is constant and set
    a priori, but does not change after the component's preparation should be
    stored in the :js:attr:`parameters`, whereas all data collected later should
    be (and is automatically) collected in the :js:attr:`data` attribute.

  .. js:attribute:: aggregateParameters

    Combination of the component's parameters and those of any superordinate
    components (read-only)

    Often, a component's content and behavior is determined not only by its own
    :js:attr:`parameters`, but also by those of superordinate components. For
    example, a component might be contained within a :js:class:`Sequence`
    representing a block of stimuli of the same type.
    In this and many similar situations, it makes sense to define parameters on
    superordinate components, which are then applied to all subordinate, nested,
    components.

    The :js:attr:`aggregateParameters` attribute combines the
    :js:attr:`parameters` of any single component with those of superordinate
    components, if there are any. Within this structure, parameters defined at
    lower, more specific, levels override those with an otherwise broader scope.

    Consider the following structure::

      const experiment = lab.flow.Sequence({
        content: [
          lab.core.Component({
            'title': 'Nested component',
            'parameters': {
              'color': 'red'
            }
          }),
        ],
        'title': 'Superordinate sequence',
        'parameters': {
          'color': 'blue',
          'text': 'green'
        }
        // ... additional options ...
      }, {
      })

    In this case, the nested component inherits the parameter ``text`` from the
    superordinate sequence, but not ``color``, because the value of this
    parameter is defined anew within the nested component itself.

  **Response handling**

  .. js:attribute:: responses

    Map of response events onto response descriptions ({})

    The responses hash maps the actions a participant might take onto the
    responses saved in the data. If a response is collected, the :js:func:`end`
    method is called immediately.

    For example, if the possible responses are to press the keys ``s`` and
    ``l``, and these map onto the categories *left* and *right*, the response
    map might look as follows::

      'responses':  {
        'keypress(s)': 'left',
        'keypress(l)': 'right'
      }

    The left part, or the keys of this object, defines the **browser event**
    corresponding to the response. This value follows the `event type syntax
    <http://www.w3.org/TR/DOM-Level-3-Events/>`_, so that any browser event may
    be caught. Additional (contrived) examples might be::

      'responses': {
        'keypress(s)': 'The s key was pressed',
        'keypress input': 'Participant typed in a form field',
        'click': 'A mouse click was recorded',
        'click button.option_1': 'Participant clicked on option 1'
      }

    As is visible in the first example, additional **options** for each event
    can be specified in brackets. These are:

    * For ``keypress`` events, the letters corresponding to the desired keys,
      or alternatively ``space`` and ``enter`` for the respective keys.
      Multiple keys can be defined by separating letters with a comma.
    * For ``click`` events, the mouse button used. Buttons are numbered from
      the index finger outwards, i.e. on a right-handed mouse, the leftmost
      button is ``0``, the middle button is ``1``, and so on, and vice versa for
      a left-handed mice. (please note that you may need to catch and handle
      the ``contextmenu`` event if you would like to stop the menu from
      appearing when the respective button is pressed.)

    Finally, a **target element** can be specified for every event (note that
    this refers to an element in the HTML page, not a part of the experiment),
    as is the case in the last example. The element in question is identified
    through a CSS selector. If an element is specified in this manner, the
    response is limited to that element, so a click will only be collected if it
    hits this specific element, and a keyboard event will only be responded to
    if the element is selected when the button is pressed (for example if text
    is input into a form field).

  .. js:attribute:: correctResponse

    Label or description of the correct response (defaults to ``null``)

    The :js:attr:`correctResponse` attribute defines the label of the normative
    response. For example, in the simple example given above, it could take
    the values ``'left'`` or ``'right'``, and the corresponding response would
    be classified as correct.

  **Timing**

  .. js:attribute:: timer

    Timer for the component (read-only)

    The :js:attr:`timer` attribute provides the central time-keeping instance
    for the component. Until the component is :js:func:`run`, it will be set to
    ``undefined``. Then, until the :js:func:`end` of an component's cycle, it
    will continuously provide the duration (in milliseconds) for which it has
    been running. Finally, once the cycle has reached its :js:func:`end`, it
    will provide the time difference between the start and the end of the
    component's run cycle.

  .. js:attribute:: timeout

    Delay between component run and automatic end (null)

    The component automatically ends after the number of milliseconds specified
    in this option, if it is set.

  **Data collection**

  .. js:attribute:: data

    Additional data ({})

    Any additional data (e.g. regarding the current trial) to be saved alongside
    automatically generated data entries (e.g. response and response time).

    This option should be an object, with the desired information in its keys
    and values.

    Please consult the entry for the :js:attr:`parameters` for an explanation
    of the difference between these and :js:attr:`data`.

  .. js:attribute:: datastore

    Store for any generated data (``null`` by default)

    A :ref:`DataStore` object to handle data collection (and export). If this
    is not set, the data will not be collected in a central location outside the
    component itself.

  .. js:attribute:: datacommit

    Whether to commit data by default (``true``)

    If you would prefer to handle data manually, unset this option to prevent
    data from being commit when the component ends.

  **Preloading media**

  .. js:attribute:: media

    Media files to preload ({})

    Images and audio files can be preloaded in the background, to reduce load
    times later during the experiment. To achieve this, supply an object
    containing the urls of the files in question, split into images and audio
    files as follows::

        'media': {
          'images': [
            'https://mydomain.example/experiment/stimulus.png'
          ],
          'audio': [
            'https://mydomain.example/experiment/sound.mp3'
          ]
        }

    Both image and audio arrays are optional, and empty by default.

    Please note that this method has some **limitations**. First, the files are
    loaded asynchronously in the background, starting during the prepare phase.
    The experiment does not wait until the files have completed loading. Second,
    the preloading mechanism is dependent upon the browser's file cache, which
    cannot be fully controlled. The media file might have been removed from the
    cache by the time it is needed. Thus, this is a somewhat brittle mechanism
    which can improve load times, but is, for technical reasons, not fail-safe.
    In our experience, testing across several browsers reliably indicates
    whether preloading is dependable for a given experiment.

  **Advanced options**

  .. js:attribute:: events

    Map of additional event handlers ({})

    In many experiments, the only events that need to be handled are responses,
    which can be defined using the :js:attr:`responses` option described above.
    However, some studies may require additional handling of events before a
    final response is collected. In these cases, the events object offers an
    alternative.

    The events option follows the same format used for the responses, as
    outlined above. However, instead of a string response, the object values on
    the right-hand side are event handler functions, which are called whenever
    the specified event occurs. The functions are expected to receive the event
    in question as an argument, and process it as they see fit. They are
    automatically bound to the component in question, which is available within
    the function through the ``this`` keyword.

    As a very basic example, one might want to ask users not to change to other
    windows during the experiment::

      'events': {
        'visibilitychange': function(event) {
          if (document.hidden) {
            alert(`Please don't change windows while the experiment is running`)
          }
        }
      }

----

Dummy
-----

The :js:class:`core.Dummy` component is a stand-in component that calls
:js:func:`end` immediately when the component is run. We use it for tests and
demonstrations, and very rarely in experiments.

.. js:class:: core.Dummy([options])

  Direct descendant of the :js:class:`core.Component` class, with the single
  difference that the :js:attr:`timeout` is set to zero by default.
