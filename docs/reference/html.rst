HTML-based displays
===================

The following elements use ``HTML`` for showing content. That's all there is to them! If you are new to ``lab.js``, these are the easiest way to get things in front of your participants.

.. contents:: Contents
  :local:

----

.. _reference/html/Screen:

Screen
------

The :js:class:`html.Screen` is a component of the experiment that changes the content of an element on the page when it is run. Otherwise, it behaves exactly as a :js:class:`core.Component` does.

.. js:class:: html.Screen([options])

  When an :js:class:`html.Screen` is constructed, it takes a single argument that specifies the component options. The most important of these is the :js:attr:`content <options.content>`, which is the string of text and ``HTML`` inserted into the document. Additional options correspond to those of a :js:class:`core.Component`.

  For example, a screen showing a simple text could be constructing as follows::

    const screen = new lab.html.Screen({
      content: '<p>Hello world!</p>',
    })

    screen.run()

  When this code is run, the screen content is shown, that is, the content string supplied is inserted into the page. Per default, the element with the attribute ``data-labjs-section="main"`` is used as an insertion point, however this may be changed using :js:attr:`el <options.el>` option.

  **Using placeholders**

  You can access the :js:attr:`parameters <options.parameters>` available through the :js:class:`html.Screen` to insert placeholders within its :js:attr:`content <options.content>`. These are filled when the screen is :js:func:`prepared <prepare>`. Through this mechanism, the exact content of a screen need not be specified fully from the onset of the study, but can be assembled dynamically depending on the structure of the experiment, and participants' behavior.

  Placeholders are delimited by ``${`` and ``}``. A parameter name can be placed within these limits in the format ``parameters.parameter_name``, and the content stored in place of the parameter will replace the placeholder as soon as the screen is prepared. Similarly, the last value in every column of the data set can be accessed via ``state.column_name``. For example, you might want to use the veracity of the last response to provide feedback via ``state.correct``.

  The following screen would produce an output equivalent to the example above, using parameters::

    const parameterScreen = new lab.html.Screen({
      content: '<p>Hello ${ parameters.place }!</p>',
      parameters: {
        place: 'World'
      },
    })

  Placeholders can contain any JavaScript expression, so basic logic can be inserted directly into a placeholder. For example, you might use the boolean value contained in ``state.correct`` to provide feedback, using a `conditional operator`_::

    const feedbackScreen = new lab.html.Screen({
      content: '<p>${ state.correct ? "Well done!" : "Please have another go!" }</p>',
    })

  .. _conditional operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator

  .. note::

    The placeholder syntax is deliberately chosen to be equivalent to JavaScript's `template literals`_. You might therefore be tempted to place the content options containing placeholders in backticks (`````) instead of quotation marks (``'`` or ``"``). Doing so will introduce a subtle difference: The option you're setting will no longer be a regular string, and your browser's JavaScript engine will attempt to compute the content in placeholders and insert the result in their place as soon as it encounters them. Because the template literal mechanism prempts and bypasses the placeholders, they won't perform their regular function.

    In sum: If your placeholders aren't doing what they are supposed to, this might be worth checking.

    .. _template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

  **Options**

  The options available for an :js:class:`html.Screen` are identical to those of the ``core.Component``. For example, one might capture :js:attr:`responses <options.responses>` as in the following example::

    const screen = new lab.html.Screen({
      content: '<p>Please press <kbd>s</kbd> or <kbd>l</kbd></p>',
      responses: {
        'keypress(s)': 's',
        'keypress(l)': 'l'
      },
    })

    screen.run()

  Similarly, the screen might be shown only for a specified amount of time (in milliseconds)::

    const timedScreen = new lab.html.Screen({
      content: '<p>Please press space, fast!</p>',
      timeout: 500, // 500ms timeout
      responses: {
        'keypress(Space)': 'response'
      },
    })

  .. seealso::
    If you are looking for very short or more precise timings, you will probably be better served using :ref:`canvas-based displays <reference/canvas>` such as the :js:class:`canvas.Screen`.

  Screens provide two new options that can be specified:

  .. js:attribute:: options.content

    ``HTML`` content to insert into the page, as text.

  .. js:attribute:: options.contentUrl

    ``URL`` from which to load ``HTML`` content as text. The content is loaded when the screen is prepared. Replaces the screen's :js:attr:`content <options.content>`.

----

.. _reference/html/Form:

Form
----

A :js:class:`html.Form` is like the :js:class:`html.Screen` described above, in that it uses ``HTML`` to display information. However, it adds support for ``HTML`` forms. This means that it will automatically react to form submission, and save form contents when it ends.

On a purely superficial level, a :js:class:`html.Form` is handled, and behaves, almost exactly like an :js:class:`html.Screen`: The :js:attr:`content <options.content>` option contains an HTML string which is rendered onscreen when the screen is shown. This is because a :js:class:`html.Form` builds upon, and extends, the :js:class:`html.Screen`. It merely handles ``HTML`` form tags somewhat more intelligently.

HTML forms
^^^^^^^^^^

``HTML`` forms make possible inputs of many kinds, ranging from free-form text entry, to checkboxes, to multiple-choice items and response buttons. This allows for a great variety of data collection methods, ranging far beyond the responses discussed so far.

As with the :js:class:`html.Screen` discussed above, we assume some familiarity with ``HTML`` forms in the following. If you would like to become familiar or reacquaint yourself with them, we have found the following resources helpful:

* `HTML5Doctor: Introduction to forms
  <http://html5doctor.com/html5-forms-introduction-and-new-attributes/>`_
* `Mozilla Developer Network: Forms in HTML
  <https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML>`_

Form handling
^^^^^^^^^^^^^

Within ``HTML`` forms, each field is represented by one or more ``HTML`` tags. The ``name`` attribute of these tags typically contains the variable in which the fields information is stored and transmitted.

For example, a very simple form containing only an input field for the participant id, and a button for submitting the form, might be represented as follows:

.. code-block:: html

    <form>
      <input type="number" name="participant-id" id="participant-id">
      <button type="submit">Save</button>
    </form>

By inserting this snippet into an ``HTML`` document, an input field is added which accepts numeric input, and also offers buttons to increment and decrease the contained value. In addition, the form can be submitted using a button. Please note that the input field is *named*, which means that any input present in the form field when the form is submitted will be represented by the key given in the ``name`` attribute, in this case ``participant-id`` (though it is common to reuse the value of the ``name`` attribute as the element's ``id`` attribute, the two are unrelated and can be chosen independently).

By combining the above code with an :js:class:`html.Form`, it can become part of an experiment::

  const screen = new lab.html.Form({
    content: '<form>' +
      '  <input type="number" name="participant-id" id="participant-id">' +
      '  <button type="submit">Save</button>' +
      '</form>'
  })

The above screen, inserted into an experiment, will display the form, and wait for the user to submit it using the supplied button. When this occurs, the form contents will automatically be transferred into the experiment's data set, and whichever value was entered into the specified field will be saved into the variable ``participant-id``.

.. js:class:: html.Form([options])

  An :js:class:`html.Form` accepts the same options and provides the same methods the :js:class:`html.Screen` does, with a few additions:

  .. seealso:: A :js:class:`html.Form` is derived from the
    :js:class:`html.Screen`, and therefore also accepts the :js:attr:`content <options.content>` and :js:attr:`contentUrl <options.contentUrl>` options.

  .. js:function:: serialize()

    Read the current form state from the page, and output it as a javascript object in which the keys correspond to the ``name`` attributes on the form fields, and the values correspond to their current states.

  .. js:function:: validate()

    :js:func:`serialize` the current form content and check its validity using the :js:attr:`validator <options.validator>`. Returns ``true`` or ``false``.

  .. js:attribute:: options.validator

    Function that accepts the serialized form input provided by the :js:func:`serialize` method, and indicates whether it is valid or not by returning ``true`` or ``false`` depending on its decision. Only if it returns ``true`` will the :js:class:`html.Form` end following submission of the form content.

    The function is also responsible for generating an error message and showing it to the user, if this is desired.

    The :js:attr:`validator <options.validator>` option defaults to a function that always returns ``true``, regardless of form content.
