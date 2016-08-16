Styling your study
==================

[making an experiment look attractive and neat is important]
Of course, we might well have missed something -- if you have a suggestion that
might be useful for many kinds of experiments, please do let us know!

You are always free to customize your experiment as you see fit -- these styles
are designed to give you a head start, and are in no way mandatory.

If you are using the starter kit to build your experiment, the basic page styles
have already been set up for you.

.. seealso::
  Many of the selectors used here correspond (on purpose) to those used in the
  `bootstrap framework`_, which provides far more comprehensive styles for many
  more applications.

  To a large degree, the supplied styles are a simplified subset and facsimile
  of bootstrap's many and beautiful styles. Please check them out if you find
  the included stylesheet lacking -- because the class names are, where
  possible, identical, switching should not be to big an effort.

  .. _bootstrap framework: https://getbootstrap.com/

----

Setting up the page
-------------------

Container
^^^^^^^^^

On the most coarse level, all content on the page is gathered inside a
**container** that holds all of the content and determines its size. You can
apply the ``container`` class to a ``div`` or another block element like so:

.. code-block:: html

  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Example Experiment</title>
    <!-- Load styles -->
    <link rel="stylesheet" href="lib/lab.css">
    <!-- Load additional styles and scripts here ... -->
  </head>
  <body>
    <!-- Define the container -->
    <div class="container">
      <!-- Container content -->
      Container
    </div>
  </body>
  </html>

This is what the result will look like.

[screenshots]

By adding the ``fullscreen`` class, you can make the container take up all
available space.

[screenshots]

Page sections
^^^^^^^^^^^^^

Getting slightly more specific, you'll likely want to subdivide the page into
different sections containing different parts of the visible information. For
example, you might want to include a header with your university's logo, a
footer with contact info or navigation buttons, and of course the main
experiment content.

You can achieve this directly by filling the container element with HTML
``header``, ``main`` and ``footer`` tags.

[screenshots]

----

Styling content
---------------

The library stylesheet includes matching default styles for many HTML elements,
such as headings, links, and form fields. You'll find that even some less-used
elements, such as the horizontal rule (``<hr>``), or the keyboard button tag
(``<kbd>key</kbd>``) have been styled.

Beyond styles for specific elements, we've tried to include CSS classes that we
hope will come in handy in may studies. These are described in the following.

Alerts
^^^^^^

Alerts help you highlight information that should not go unnoticed.

The basic ``alert`` class, applied to a ``<div>`` tag, will emphasize its
content by placing it on a grey background. Adding the ``alert-warning`` or
``alert-danger`` class will change the color to yellow and red for drawing
further attention.

.. code-block:: html

  <div class="alert">Let me draw your attention to this</div>
  <div class="alert alert-warning">You have been warned</div>
  <div class="alert alert-danger">Something is deeply wrong here</div>

[screenshots]

Tables
^^^^^^

The default stylesheet adds horizontal dividers between the rows of tables
(this deviates from the bootstrap defaults, which require the ``table`` class
for styling). Any additional styles can be removed by adding the ``table-plain``
class to the table.

.. code-block:: html

  <table>
    <tr>
      <th>Table header 1</th>
      <th>Table header 2</th>
    </tr>
    <tr>
      <td>Table data 1a</td>
      <td>Table data 2a</td>
    </tr>
    <tr>
      <td>Table data 1b</td>
      <td>Table data 2b</td>
    </tr>
  </table>

[screenshot]

Adding the ``table-striped`` class to the table adds striped rows:

[screenshot]

[can we get a more interesting example for this?]

Contextual text formatting
^^^^^^^^^^^^^^^^^^^^^^^^^^

Like the alerts shown above, there is often the need to mark text as secondary.
The ``text-muted`` class achieves, applied to an element, will color its content
in gray.

Text helper classes
^^^^^^^^^^^^^^^^^^^

The ``font-weight-bold`` and ``font-italic`` classes change the formatting of
an element's text content.

----

Positioning things
------------------

Positioning block elements
^^^^^^^^^^^^^^^^^^^^^^^^^^

The most common challenge encountered in building an experiment is the alignment
of stimuli and other content.

The ``content-vertical-center``, ``content-horizontal-center`` and
``content-horizontal-right`` classes place a single element in the vertical
center of it surrounding element, and, independently, in the horizontal center
and at the right border. Both sets of classes can be used in conjunction.

[there should really be content-vertical-top and -bottom classes, and
-horizontal-left classes. Ronja, if you like, you can assume these in your
documentation, and I will add them. The point about the single element should
probably also be emphasized: The idea is that there is a surrounding container,
like a <div> to which these classes are applied, which contains a single direct
descendant for which the position is chosen. Otherwise, things will get funky,
and this has been an issue in the last MJ class.]

Width
^^^^^

To force elements to use all available width, add the ``w-100`` class.

[note: There should probably be w-50 etc., but this will do for the moment]

Aligning text
^^^^^^^^^^^^^

The ``text-left``, ``text-center`` and ``text-right`` classes align text to
the left, center and right of its containing block.

Element visibility
^^^^^^^^^^^^^^^^^^

The ``invisible`` class hides an element from view, but still includes it in
the layout. Thereby, an empty space remains where the element would otherwise
have been rendered.

The ``hidden`` class excludes an element from rendering, meaning that it will
not affect the page display in any way.

The ``hide-if-empty`` class removes an element from the page if it does not
contain content.
