Designing a basic screen
========================

In the last part of the tutorial, we took a brief look at the builder interface. We added a very basic screen with some simple content to get a feel for things. In the following, we'll build on our new knowledge, with the aim of assembling our first useful screen. Our goal will be to assemble a working stroop experiment, and we'll focus on the central display first.

.. |clearfloat| raw:: html

  <div style="clear: both"></div>

.. raw:: html

  <style type="text/css">
    .document img {
      margin-bottom: 5px;
      border: 1px solid #e1e4e5;
      border-radius: 5px;
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.05);
    }
    table.docutils.table-img {
      border: none !important;
    }
    table.docutils.table-img tbody tr td {
      border: none;
      background-color: transparent !important;
    }
  </style>

----

The Stroop task
---------------

Over the course of this tutorial, we'll put together a basic **Stroop paradigm**. The `Stroop effect`_ is a classic result from cognitive psychology; it describes the finding that people take longer to indicate the color of a word when the word denotes a different color. Very basically, the idea is that the process of naming the color suffers from interference by the automatic impulse to read the word and process its meaning.

You can see the effect at work in the following figure. Try to name *the color of each word*, as quickly as you can!

.. |fig1| image:: 2-screen/stroop.png
   :scale: 100%

.. rst-class:: table-img

  +--------------+
  | |fig1|       |
  +--------------+


In studies using the stroop task, words are typically shown one by one, and participants respond to each in turn. This is what we'll build.

.. _Stroop effect: https://en.wikipedia.org/wiki/Stroop_effect

----

Including ``CSS`` styles
------------------------

As a first step, let's construct a screen that contains just a color word, say 'blue'. Previewing the study at this stage shows a relatively unremarkable result:

.. figure:: 2-screen/1.png
   :alt: Just the text
   :figwidth: 45%
   :align: right

.. code-block:: html

  blue

|clearfloat|

In terms of our screen, we'll treat the word as the main content, and we can indicate that by enclosing it in ``<main>`` tags, as in the following example:

.. figure:: 2-screen/2.png
   :alt: Added main tag
   :figwidth: 45%
   :align: right

.. code-block:: html

  <main>
    blue
  </main>

|clearfloat|

You'll notice that adding the tags has already slightly changed the display: The text is now centered horizontally. This is because the :ref:`stylesheet <tutorial/style>` has picked up the additional information we've provided by labelling the main area, and is trying to apply some useful styles.

Let's go beyond the default styles slightly by changing the color of the word as the next step. To communicate our desire, we'll need to add some more information to the tag; specifically, we can use the ``style`` attribute to add ``CSS`` information that governs the content display. Here, we'll set the ``color`` to ``orange``:

.. figure:: 2-screen/3.png
   :alt: Life in color
   :figwidth: 45%
   :align: right

.. code-block:: html

  <main
    style="color: orange"
  >
    blue
  </main>

|clearfloat|

Similarly, wouldn't it be nice if the font were more clearly visible? This we can achieve by including two more instructions, ``font-size: 2rem`` (double the font size relative to the page default) and ``font-weight: bold``. Each formatting option is separated by a semicolon:

.. figure:: 2-screen/4.png
   :alt: Custom styles
   :figwidth: 30%
   :align: right

.. code-block:: html

  <main
    style="color: orange; font-size: 2rem; font-weight: bold;"
  >
    blue
  </main>

|clearfloat|

----

Pre-defined styles
------------------

Looking at our previous result, we have lots of empty unused space onscreen -- let's fix that, by placing the word smack-dab in the center of the screen. We could go the same route as before and define the styles by hand, however, positioning things is slightly finicky -- because it's nevertheless a frequent task, the default stylesheet provides some pre-made sets of styles that we can apply to help us. To use these pre-defined styles, we'll need to add a `class attribute`_ to our tag, so as to label it as one of the *class* of ``main`` tags which position their content in the center on both axes:

.. figure:: 2-screen/5.png
   :alt: Stimulus in the center of attention
   :figwidth: 30%
   :align: right

.. code-block:: html

  <main
    style="color: orange; font-size: 2rem; font-weight: bold;"
    class="content-horizontal-center content-vertical-center"
  >
    blue
  </main>

|clearfloat|

.. _class attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class

----

Additional page elements
------------------------

So far, we've put together the main part of our stroop screen, the stimulus. In an actual study, we'd probably want to go slightly beyond that, and have a summary of the instructions visible throughout.

We achieve this by adding another part to the page, beyond the main content -- a footer which is placed at the bottom of the screen. Inside the footer, we can place a paragraph of text, and (optionally) mark and highlight its individual parts as such (the ``p`` tag marks a paragraph, ``em`` is for emphasis, and ``kbd`` a keyboard button):

.. figure:: 2-screen/6.png
   :alt: Full page with footer
   :figwidth: 30%
   :align: right

.. code-block:: html

  <!-- As above -->
  <main
    style="color: orange; font-size: 2rem; font-weight: bold;"
    class="content-horizontal-center content-vertical-center"
  >
    blue
  </main>

  <!-- Additional footer -->
  <footer
    class="content-vertical-center content-horizontal-center"
  >
    <p>
      What's the <em>color</em> of the word shown above?<br>
      Please press <kbd>r</kbd> for red, <kbd>g</kbd> for green,
      <kbd>b</kbd> for blue and <kbd>o</kbd> for orange.
    </p>
  </footer>

|clearfloat|

This is starting to look good, isn't it?

----

Recap & pointers
----------------

In this part of the tutorial, we've gone from a plain word onscreen to a complete display. Along the way, we've seen how custom styles can be used to format content, and how pre-made classes can handle common layout needs.

In ``lab.js``, the entire power and flexibility of ``HTML`` and ``CSS`` are at your disposal to help you design your screens. The default stylesheet provides a basic framework for the page, and adds some styles to common elements. You are always free to override it, or to remove it entirely if you prefer using custom styles.

If you'd like to learn more about the capabilities of ``HTML`` and ``CSS`` or refresh your knowledge, here are some resources we like to recommend:

**Introductions and tutorials**

* `Learn HTML and CSS <https://www.codecademy.com/learn/learn-html-css>`_:
  Hands-on interactive course by Codecademy
* `Learn web development <https://developer.mozilla.org/en-US/docs/Learn>`_:
  Compilation of resources on the Mozilla developer network
* `HTMLDog guides <http://htmldog.com/guides/>`_

**Reference material**

* `Lab.js built-in styles <tutorial/style>`_
* `Mozilla developer network (MDN) <https://developer.mozilla.org/en-US/docs/Web>`_:
  Web technology for developers
* `Devdocs.io <https://devdocs.io>`_ reference documentation `HTML <https://devdocs.io/html/>`_ and `CSS <https://devdocs.io/css/>`_
