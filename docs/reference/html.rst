HTML-based displays
===================

The following elements use ``HTML`` for showing content. That's all there is to
them! If you are new to ``lab.js``, these are the easiest way to get things in
front of your participants.

.. contents:: Contents
  :local:

----

.. _reference/html/HTMLScreen:

HTMLScreen
----------

The :js:class:`HTMLScreen` is an element of the experiment that changes the
content of an element on the page when it is run. Otherwise, it behaves exactly
as a :js:class:`BaseElement` does.

.. js:class:: HTMLScreen(content, [options])

  When an :js:class:`HTMLScreen` is constructed, it takes two arguments. The
  first is the :js:attr:`content`, which is the string of text inserted into the
  HTML document. It can contain any HTML tags alongside textual content. The
  second argument can contain options that govern the screen's behavior, which
  correspond to those of a :js:class:`BaseElement`. For example, a single screen
  could be inserted into a document as follows::

    const screen = new lab.HTMLScreen(
      '<p>Hello world!</p>', // Content
      { // Options
        el: document.getElementById('experiment')
      }
    )

    screen.prepare()
    screen.run()

  When this code is run, a single screen is shown, that is, the content string
  supplied is inserted into the the element specified in the options. In this
  case, the element with the id 'experiment' is used to display the content.

  **Options**

  The options available for an ``HTMLScreen`` are identical to those of the
  ``BaseElement``. For example, one might capture responses as in the following
  example::

    const screen = new lab.HTMLScreen(
      '<p>Please press <kbd>s</kbd> or <kbd>l</kbd></p>',
      {
        el: document.getElementById('experiment'),
        responses: {
          'keypress(s)': 's',
          'keypress(l)': 'l'
        }
      }
    )

    screen.prepare()
    screen.run()

  Similarly, the screen might be shown only for a specified amount of time (in
  milliseconds)::

    const timedScreen = new lab.HTMLScreen(
      '<p>Please press space, fast!</p>',
      {
        el: document.getElementById('experiment'),
        responses: {
          'keypress(space)': 'response'
        },
        timeout: 500 // 500ms timeout
      }
    )

  .. seealso::
    If you are looking for very short or more precise timings, you will probably
    be better served using :ref:`canvas-based displays <reference/canvas>` such
    as the :js:class:`CanvasScreen`.

  However, there are two more options that might be set:

  .. js:attribute:: content

    ``HTML`` content to insert into the page, as text.

  .. js:attribute:: contentUrl

    ``URL`` from which to load ``HTML`` content as text. The content is loaded
    when the screen is prepared. Replaces :js:attr:`content`.

----

FormScreen
----------

A :js:class:`FormScreen` is like the :js:class:`HTMLScreen` described above in
that it uses ``HTML`` to display information. However, it adds support for
``HTML`` forms. This means that it will automatically react to form submission,
and save form contents when it ends.

On a purely superficial level, a :js:class:`FormScreen` is handled, and behaves,
almost exactly like an :js:class:`HTMLScreen`: The first option contains an HTML
string which is rendered onscreen when the screen is shown. This is because a
:js:class:`FormScreen` builds upon, and extends, the :js:class:`HTMLScreen`. It
merely handles a HTML form tags intelligently.

HTML forms
""""""""""

``HTML`` forms make possible inputs of many kinds, ranging from free-form text
entry, to checkboxes, to multiple-choice items and response buttons. This allows
for a great variety of data collection methods, ranging far beyond the responses
discussed so far.

As with the :js:class:`HTMLScreen` discussed above, we assume some familiarity
with ``HTML`` forms in the following. If you would like to become familiar or
reacquaint yourself with them, we have found the following resources helpful:

* `HTML5Doctor: Introduction to forms
  <http://html5doctor.com/html5-forms-introduction-and-new-attributes/>`_
* `Mozilla Developer Network: Forms in HTML
  <https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML>`_

Form handling
"""""""""""""

Within ``HTML`` forms, each field is represented by one or more ``HTML`` tags.
The ``name`` attribute of these tags typically contains the variable in which
the fields information is stored and transmitted.

For example, a very simple form containing only an input field for the
participant id, and a button for submitting the form, might be represented as
follows::

  <form>
    <input type="number" name="participant-id" id="participant-id">
    <button type="submit">Save</button>
  </form>

By inserting this snippet into an ``HTML`` document, an input field is added
which accepts numeric input, and also offers buttons to increment and decrease
the contained value. In addition, the form can be submitted using a button.
Please note that the input field is *named*, which means that any input present
in the form field when the form is submitted will be represented by the key
given in the ``name`` attribute, in this case ``participant-id`` (though it is
common to reuse this key as the element's ``id`` attribute, the two are
unrelated and can be chosen independently).

By combining the above code with a :js:class:`FormScreen`, it can become part of
an experiment::

  const screen = new lab.FormScreen(
    '<form>' +
    '  <input type="number" name="participant-id" id="participant-id">' +
    '  <button type="submit">Save</button>' +
    '</form>',
    {
      el: document.getElementById('experiment')
    }
  )

The above screen, inserted into an experiment, will display the form, and wait
for the user to submit it using the supplied button. When this occurs, the form
contents will automatically be transferred into the experiment's data set, and
whichever value was entered into the specified field will be saved into the
variable ``participant-id``.

.. js:class:: FormScreen(content, [options])

  A :js:class:`FormScreen` accepts the same options and provides the same
  methods the :js:class:`HTMLScreen` does, with a few additions:

  .. js:function:: serialize()

    Read the current form state from the page, and output it as a javascript
    object in which the keys correspond to the ``name`` attributes on the form
    fields, and the values correspond to their current states.

  .. js:attribute:: validator

    Function that accepts the serialized form input provided by the
    :js:func:`serialize` method, and indicates whether it is valid or not by
    returning ``true`` or ``false`` depending on its decision. Only if it
    returns ``true`` will the :js:class:`FormScreen` end.

    The function is also responsible for generating an error message and
    showing it to the user, if desired.

    The :js:attr:`validator` option defaults to a function that always returns
    ``true``, regardless of form content.

  .. js:function:: validate()

    :js:func:`serialize` the current form content and check its validity using
    the :js:attr:`validator`. Returns ``true`` or ``false``.
