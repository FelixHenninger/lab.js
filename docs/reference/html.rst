HTML-based displays
===================

The following elements use ``HTML`` for showing content. That's all there is to
them! If you are new to ``lab.js``, these are the easiest way to get things in
front of your participants.

.. contents:: Contents
  :local:

----

.. _reference/html/Screen:

Screen
------

The :js:class:`html.Screen` is a component of the experiment that changes the
content of an element on the page when it is run. Otherwise, it behaves exactly
as a :js:class:`core.Component` does.

.. js:class:: html.Screen([options])

  When an :js:class:`html.Screen` is constructed, it takes a single argument
  that specifies the component options. The most important of these is the
  :js:attr:`content`, which is the string of text inserted into the HTML
  document. It can contain any HTML tags alongside textual content. Additional
  options correspond to those of a :js:class:`core.Component`.

  For example, a single screen could be inserted into a document as follows::

    const screen = new lab.html.Screen({
      content: '<p>Hello world!</p>',
      el: document.querySelector('[data-labjs-section="main"]'),
    })

    screen.run()

  When this code is run, a single screen is shown, that is, the content string
  supplied is inserted into the the element specified in the options. In this
  case, the element with the attribute ``data-labjs-section="main"`` is used to
  contain the content. This is the default value for the :js:attr:`el`
  attribute, so we omit it in the following.

  **Using placeholders and parameters**

  You can access the :js:attr:`parameters` available through the
  :js:class:`html.Screen` to insert placeholders within its :js:attr:`content`.
  These are filled when the screen is :js:func:`prepared <prepare>`. Thereby,
  the exact content need not be specified initially.

  Placeholders are delimited by ``${`` and ``}``. A parameter name can be placed
  within these limits, and the parameter content will replace the placeholder as
  soon as the screen is prepared.

  For example, the following screen would produce an output equivalent to the
  example above::

    const parameterScreen = new lab.html.Screen({
      content: '<p>Hello ${ place }!</p>',
      parameters: {
        place: 'World'
      },
    })

  **Options**

  The options available for an :js:class:`html.Screen` are identical to those of
  the ``core.Component``. For example, one might capture :js:attr:`responses` as
  in the following example::

    const screen = new lab.html.Screen({
      content: '<p>Please press <kbd>s</kbd> or <kbd>l</kbd></p>',
      responses: {
        'keypress(s)': 's',
        'keypress(l)': 'l'
      },
    })

    screen.run()

  Similarly, the screen might be shown only for a specified amount of time (in
  milliseconds)::

    const timedScreen = new lab.html.Screen({
      content: '<p>Please press space, fast!</p>',
      responses: {
        'keypress(space)': 'response'
      },
      timeout: 500 // 500ms timeout
    })

  .. seealso::
    If you are looking for very short or more precise timings, you will probably
    be better served using :ref:`canvas-based displays <reference/canvas>` such
    as the :js:class:`canvas.Screen`.

  However, there are two new, additional, options that can be set:

  .. js:attribute:: content

    ``HTML`` content to insert into the page, as text.

  .. js:attribute:: contentUrl

    ``URL`` from which to load ``HTML`` content as text. The content is loaded
    when the screen is prepared. Replaces :js:attr:`content`.

----

.. _reference/html/Form:

Form
----

A :js:class:`html.Form` is like the :js:class:`html.Screen` described above, in
that it uses ``HTML`` to display information. However, it adds support for
``HTML`` forms. This means that it will automatically react to form submission,
and save form contents when it ends.

On a purely superficial level, a :js:class:`html.Form` is handled, and behaves,
almost exactly like an :js:class:`html.Screen`: The :js:attr:`content` option
contains an HTML string which is rendered onscreen when the screen is shown.
This is because a :js:class:`html.Form` builds upon, and extends, the
:js:class:`html.Screen`. It merely handles ``HTML`` form tags somewhat more
intelligently.

HTML forms
^^^^^^^^^^

``HTML`` forms make possible inputs of many kinds, ranging from free-form text
entry, to checkboxes, to multiple-choice items and response buttons. This allows
for a great variety of data collection methods, ranging far beyond the responses
discussed so far.

As with the :js:class:`html.Screen` discussed above, we assume some familiarity
with ``HTML`` forms in the following. If you would like to become familiar or
reacquaint yourself with them, we have found the following resources helpful:

* `HTML5Doctor: Introduction to forms
  <http://html5doctor.com/html5-forms-introduction-and-new-attributes/>`_
* `Mozilla Developer Network: Forms in HTML
  <https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML>`_

Form handling
^^^^^^^^^^^^^

Within ``HTML`` forms, each field is represented by one or more ``HTML`` tags.
The ``name`` attribute of these tags typically contains the variable in which
the fields information is stored and transmitted.

For example, a very simple form containing only an input field for the
participant id, and a button for submitting the form, might be represented as
follows:

.. code-block:: html

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
common to reuse the value of the ``name`` attribute as the element's ``id``
attribute, the two are unrelated and can be chosen independently).

By combining the above code with an :js:class:`html.Form`, it can become part of
an experiment::

  const screen = new lab.html.Form({
    content: '<form>' +
      '  <input type="number" name="participant-id" id="participant-id">' +
      '  <button type="submit">Save</button>' +
      '</form>'
  })

The above screen, inserted into an experiment, will display the form, and wait
for the user to submit it using the supplied button. When this occurs, the form
contents will automatically be transferred into the experiment's data set, and
whichever value was entered into the specified field will be saved into the
variable ``participant-id``.

.. js:class:: html.Form([options])

  An :js:class:`html.Form` accepts the same options and provides the same
  methods the :js:class:`html.Screen` does, with a few additions:

  .. seealso:: A :js:class:`html.Form` is derived from the
    :js:class:`html.Screen`, and therefore also accepts the :js:attr:`content`
    and :js:attr:`contentUrl` options

  .. js:function:: serialize()

    Read the current form state from the page, and output it as a javascript
    object in which the keys correspond to the ``name`` attributes on the form
    fields, and the values correspond to their current states.

  .. js:attribute:: validator

    Function that accepts the serialized form input provided by the
    :js:func:`serialize` method, and indicates whether it is valid or not by
    returning ``true`` or ``false`` depending on its decision. Only if it
    returns ``true`` will the :js:class:`html.Form` end following submission of
    the form content.

    The function is also responsible for generating an error message and
    showing it to the user, if this is desired.

    The :js:attr:`validator` option defaults to a function that always returns
    ``true``, regardless of form content.

  .. js:function:: validate()

    :js:func:`serialize` the current form content and check its validity using
    the :js:attr:`validator`. Returns ``true`` or ``false``.
