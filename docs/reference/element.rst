Elements
========

The ``BaseElement`` class is the most basic class provided by lab.js . It is the
foundation for all other components, which extend and slightly modify this
basic class. As per the philosophy of lab.js, experiments are composed entirely
out of these elements, which provide the structure of the study's code.

In many cases, you will not include a ``BaseElement`` directly in your
experiment. Instead, your experiment will most likely consist of the other
building blocks which lab.js provides, all of which derive from this basic
pattern.

All other elements provided by this library, however, show the same behaviour,
and accept the same options, so that you will (hopefully) find yourself
referring to this part of the documentation from time to time.

Usage
-----

The ``BaseElement`` does not, by itself, display information or modify
the page. However, it can be (and is throughout lab.js) extended to suit
even very complex requirements.

An element is constructed only an object containing options regarding
its behavior. ::

  var e = new lab.BaseElement({
    'responses': {
      'keypress(s)': 'left',
      'keypress(l)': 'right'
    },
    'timeout': 1000
  })

  e.prepare()
  e.run()

Behaviour
---------

Following its creation, an element will go through several distinct **stages**.

The **preparation** stage is designed to prepare the element for its later
use in the experiment in the best possible way. For example, a display might be
prerendered during this phase, and any necessary assets loaded. Importantly,
by the time an element is prepared, its settings have to have been finalized.

The **run** stage is the big moment for any element of an experiment. Upon
running, the element assumes (some degree of) control over the study: It starts
capturing and responding to events triggered by the user, it might display
information or stimuli on screen, through sound, or by any other means.

The **end** marks the close of an element's activity. It cedes control over
the output, and stops listening to any events emitted by the browser. If there
are data to log, it is taken care of after the element's run is complete.
Similarly, any housekeeping or cleaning-up is done at this point.

Options
-------

**Metadata**

``title`` · Human-readable title for the element (null)
  Included in any data stored by the element,
  and could be used for distinguishing between
  elements.

``id`` · Machine-readable element id (null)
  Sequences will automatically number contained elements when prepared.

**Response handling**

``responses`` · Map of response events onto response descriptions ({})
  The responses hash maps the actions a participant might take onto
  the responses saved in the data. If a response is collected, the element
  ends immediately.

  For example, if the possible responses are to press the keys ``s`` and ``l``,
  and these map onto the categories *left* and *right*, the response map would
  look as follows::

    'responses':  {
      'keypress(s)': 'left',
      'keypress(l)': 'right'
    }

  The left part, or the keys of this object, defines the **browser event**
  corresponding to the response. This value follows the `event type syntax
  <http://www.w3.org/TR/DOM-Level-3-Events/>`_, so that any browser event may be
  caught. Additional (contrived) examples might be::

    'responses': {
      'keypress(s)': 'The s key was pressed',
      'click': 'A mouse click was recorded',
      'click button.option_1': 'Participant clicked on option 1'
    }

  As is visible in the first example, additional **options** for each event
  can be specified in brackets. These are:

  * For ``keypress`` events, the letters corresponding to the desired keys,
    or alternatively ``space`` and ``enter`` for the respective keys.
  * For ``click`` events, the mouse button used. Buttons are numbered from
    the index finger outwards, i.e. on a right-handed mouse, the leftmost
    button is ``0``, the middle button is ``1``, and so on, and vice versa for
    a left-handed mice. (please not that you may have to catch and handle
    the ``contextmenu`` event if you would like to stop the menu from appearing
    when the respective button is pressed.)

  Finally, a **target element** can be specified for every event (note that this
  refers to an element in the HTML page, not an element of the experiment), as
  is the case in the last example. The element in question is identified through
  a CSS selector. If an element is specified in this manner, the response is
  limited to that element, so a click will only be collected if it hits this
  specific element, and a keyboard event will only be responded to if the
  element is selected when the button is pressed (for example if text is input
  into a form field).

``timeout`` · Delay between element run and automatic end (null)
  The element automatically ends after the number of milliseconds
  specified in this option, if it is provided.


**Data collection**

``data`` · Additional data ({})
  Any additional data (e.g. regarding the current trial) to be saved alongside
  automatically generated data entries (e.g. response and response time).

  This option should be an object, with the desired information in its keys
  and values.

``datastore`` · Store for any generated data (null)
  A :ref:`DataStore` object to handle data collection (and export). If this
  is not set, the data will not be collected.

``datacommit`` · Whether to commit data by default (true)
  If you would prefer to handle data manually, unset this option to prevent
  data from being commit when the element ends.

**Preloading media**

``media`` · Media files to preload
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

  Please note that this method has some limitations. First, the files are loaded
  asynchronously in the background, starting during the prepare phase. The
  experiment does not wait until the files have completed loading. Second, the
  preloading mechanism is dependent upon the browser's file cache, which cannot
  be fully controlled. The media file might have been removed from the cache by
  the time it is needed. Thus, this is a somewhat brittle mechanism which can
  improve load times, but is, for technical reasons, not fail-safe. In our
  experience, testing across several browsers reliably indicates whether
  preloading is dependable for a given experiment.

**Advanced options**

``events`` · Map of additional event handlers ({})
  In many experiments, the only events that need to be handled are responses,
  which can be defined using the response option described above.
  However, some studies may require additional handling of events before
  a final response is collected. In these cases, the events object offers
  an alternative.

  The events option follows the same format used for the responses, as outlined
  above. However, instead of a string response, the object values on the
  right-hand side are event handler functions, which are called whenever the
  specified event occurs. The functions are expected to receive the event
  in question as an argument, and process it as they see fit. They are
  automatically bound to the element in question, which is available within
  the function through the ``this`` keyword.
