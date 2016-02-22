Canvas-based displays
=====================

The ``canvas`` is an alternate method of displaying content and stimuli on the
screen. The underlying principle are true to the canvas metaphor: A canvas is
a (rectangular) area on which lines, shapes and text can be drawn, to be shown
to the user.

As `Mark Pilgrim  <http://diveintohtml5.info/canvas.html>`_ has put it: "A
canvas is a rectangle in your page where you can use JavaScript to draw anything
you want."

----

Introduction to the canvas
--------------------------

Why canvas?
^^^^^^^^^^^

If a canvas basically does the same thing as HTML, why, then, is it useful? The
primary reason is that browsers are often doing more work for us than we
realize. In particular, for any HTML content, it is the browser's responsibility
to  maintain the layout of the page. Whenever a page's content changes, browsers
need to recalculate the layout, to make sure that any newly inserted text pushes
the content below further downward, that all text is wrapped neatly around newly
inserted images, and that all style rules are maintained. You might imagine this
process like continuously trying to layout a newspaper's front page while new
content is added and deleted simultaneously. Naturally, this process takes time,
and if we rely on the browser to react very quickly and update the display
rapidly in response to our changing the content, the resulting delay might be
too long, resulting in lag.

A ``canvas`` does away with continuous layout recalculation, and instead
provides us with space on which we can happily paint and collage the content
ourselves. The browser no longer assumes responsibility for our layout, but
leaves us to squiggle at our hearts' content. If things overlap, no worries --
the browser can always paint on top! This simplifies things immensely for the
browser, but it requires a bit more thought from our side: We can no longer, for
example, ask the browser nicely to center content for us; instead, we need to
calculate its position and place it ourselves.

Canvas graphics are *raster-based*, that is, the browser remembers the color of
each pixel across the canvas, rather than the shapes and text that the colored
pixels represent. This means that a canvas cannot change its size easily; if it
does, the pixels will be warped, resulting in a blurry display. To achieve crisp
images, it is our responsibility to redraw content at different sizes depending
on the screen resolution. This sets it apart from *vector graphics*, which
represent a display through the shapes visible on it, and can be redrawn at
different sizes and resolutions without loss in quality.

Resources for learning
^^^^^^^^^^^^^^^^^^^^^^

It would be impossible to cover the usage of the canvas in detail here, but
luckily there are excellent resources available from more knowledgable authors.
We have compiled a few in the following:

* `Mozilla Developer Network: Canvas Tutorial
  <https://developer.mozilla.org/docs/Web/Guide/HTML/Canvas_Tutorial>`_ --
  excellent introduction to the canvas, available in multiple languages
* `Mozilla Developer Network: Canvas API
  <https://developer.mozilla.org/docs/Web/HTML/Canvas>`_ -- A comprehensive
  overview of the canvas API


.. caution::
  The ``CanvasScreen`` API, while completely functional, is not entirely settled
  yet. You are absolutely invited to use it, however please bear in mind that
  some details might change over time, as everybody gathers experience using
  it.

  In particular, the part that is most likely to change is the handling of
  animation. This is because this is the aspect of the canvas which the authors
  have the least experience with. If you are using a ``canvas`` to show animated
  content within an experiment, and would be willing to share thoughts or even
  code, please be warmly invited to drop us a line.
