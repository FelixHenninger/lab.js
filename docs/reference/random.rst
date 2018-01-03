Random data generation
======================

**In many studies, stimuli aren't defined ahead of time, but generated randomly for every participant anew.** For this purpose, ``lab.js`` contains flexible (pseudo-)random data generation utilities.

All random data generation is handled by the :js:class:`util.Random` class. Every component in a study has direct access this utility through its ``random`` property. Thus, to generate, for example, a random integer up to ``n`` in a component script, one would write ``this.random.range(n)``. (for the sake of completeness: Outside of a component, the class can be instantiated and used by itself).

As an example, to randomly compute a parameter (which you could later use inside your screen content, or anywhere else where placeholders are accepted), you might use the following code in a script that runs before the component is prepared::

  this.options.parameters['greeting'] =
    this.random.choice(['aloha', 'as-salamualaikum', 'shalom', 'namaste'])

This will select one of the greetings at random, and save it in the ``greeting`` parameter. The value is then available for re-use whereever parameters can be inserted, and will be included in the dataset.

You can alternatively use these functions directly inside of a placeholder, such as ``${ this.random.choice(['hej', 'hola', 'ciao']) }``, and include this placeholder in the screen content. This shows a random greeting without preserving the message in the data.

In practice of course, you'll probably be randomly generating more useful information, such as the assignment to one of several conditions.

----

.. js:class:: util.Random([options])

  A set of utilities with (pseudo-)random behavior, all drawing on the same source of randomness. By default, the random source is the browsers built-in random number generator, ``Math.random``.

  .. js:function:: random()

    :returns: A floating-point number in the range from ``0`` (inclusive) to ``1`` (exclusive).

  .. js:function:: range(ceiling)

    :returns: An integer between ``0`` and ``ceiling - 1``

  .. js:function:: choice(array)

    :returns: A random element from the ``array`` provided.

  .. js:function:: sample(array, n, [replacement=false])

    :returns: ``n`` elements drawn from an ``array`` with or without replacement (default).

  .. js:function:: shuffle(array)

    :returns: A shuffled copy of the input ``array``.

  .. js:function:: uuid4()

    :returns: A `version 4 universally unique identifier`_ as a string, e.g. ``2b4a88ca-52ba-4950-9ec2-06f07f944fed``

    .. _version 4 universally unique identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
