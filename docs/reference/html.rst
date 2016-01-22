HTML-based displays
===================

The following elements use ``HTML`` for showing content.

.. _reference/html/HTMLScreen:

HTMLScreen
----------

The ``HTMLScreen`` is an element of the experiment that changes the content
of an element on the page when it is run. Otherwise, it behaves exactly as a
``BaseElement`` does.

Usage
^^^^^

When a ``HTMLScreen`` is constructed, it needs two options. The first is the
*content*, which is the string of text inserted into the HTML document. It can
contain any HTML tags alongside textual content. For example, a single screen
could be inserted into a document as follows::

  screen = new lab.HTMLScreen(
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

  screen = new lab.HTMLScreen(
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

  timedScreen = new lab.HTMLScreen(
    '<p>Please press space, fast!</p>',
    {
      el: document.getElementById('experiment'),
      responses: {
        'keypress(space)': 'response'
      }
    }
  )
