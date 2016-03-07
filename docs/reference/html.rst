HTML-based displays
===================

The following elements use ``HTML`` for showing content. That's all there is to
them!

.. contents:: Contents
  :local:

----

.. _reference/html/HTMLScreen:

HTMLScreen
----------

The ``HTMLScreen`` is an element of the experiment that changes the content
of an element on the page when it is run. Otherwise, it behaves exactly as a
``BaseElement`` does.

Usage
^^^^^

When a ``HTMLScreen`` is constructed, it takes two arguments. The first is the
*content*, which is the string of text inserted into the HTML document. It can
contain any HTML tags alongside textual content. The second argument can contain
options that govern the screen's behavior, which correspond to those of a
:ref:`BaseElement <reference/base/BaseElement>`. For example, a single screen
could be inserted into a document as follows::

  let screen = new lab.HTMLScreen(
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

Options
^^^^^^^

The options available for an ``HTMLScreen`` are identical to those of the
``BaseElement``. For example, one might capture responses as in the following
example::

  let screen = new lab.HTMLScreen(
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

  let timedScreen = new lab.HTMLScreen(
    '<p>Please press space, fast!</p>',
    {
      el: document.getElementById('experiment'),
      responses: {
        'keypress(space)': 'response'
      },
      timeout: 500 // 500ms timeout
    }
  )

----

FormScreen
----------

A ``FormScreen`` is like the ``HTMLScreen`` described above, but it includes
support for HTML forms. This means that it will automatically react to form
submission, and save form contents when it ends.

Usage
^^^^^

On a purely superficial level, a ``FormScreen`` is handled, and behaves, almost
exactly like an ``HTMLScreen``: The first option contains an HTML string which
is rendered onscreen when the screen is shown. This is because a ``FormScreen``
builds upon, and extends, the ``HTMLScreen`` functionality. It merely handles a
HTML form tags intelligently.

HTML forms
""""""""""

HTML forms make possible inputs of many kinds, ranging from free-form text
entry, to checkboxes, to multiple-choice items and response buttons. This allows
for a great variety of data collection methods, ranging far beyond the responses
discussed so far.

As with the pure HTML discussed above, we assume some familiarity with HTML
forms in the following. If you would like to become familiar or reacquaint
yourself with them, we have found the following resources helpful:

* `HTML5Doctor: Introduction to forms
  <http://html5doctor.com/html5-forms-introduction-and-new-attributes/>`_
* `Mozilla Developer Network: Forms in HTML
  <https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML>`_

Form handling
"""""""""""""

Within HTML forms, each field is represented by one or more HTML tags. The
``name`` attribute of these tags typically contains the variable in which the
fields information is stored and transmitted.

For example, a very simple form containing only an input field for the
participant id, and a button for submitting the form, might be represented as
follows::

  <form>
    <input type="number" name="participant-id" id="participant-id">
    <button type="submit">Save</button>
  </form>

By inserting this snippet into an HTML document, an input field is added which
accepts numeric input, and also offers buttons to increment and decrease the
contained value. In addition, the form can be submitted using a button. Please
note that the input field is *named*, which means that any input present in the
form field when the form is submitted will be represented by the key given in
the ``name`` attribute, in this case ``participant-id`` (though it is common to
reuse this key as the element's ``id`` attribute, the two are unrelated and can
be chosen independently).

By combining the above code with a ``FormScreen``, it can become part of an
experiment::

  let screen = new lab.FormScreen(
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
