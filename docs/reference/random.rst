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

  .. js:function:: range(a, [b])

    :returns: If only a single value is given, a random integer between ``0`` and ``ceiling - 1``; if two values are passed, an integer value between ``offset`` and ``ceiling - 1``.

  .. js:function:: choice(array)

    :returns: A random element from the ``array`` provided.

  .. js:function:: sample(array, n, [replacement=false])

    :returns: ``n`` elements drawn from an ``array`` with or without replacement (default).

  .. js:function:: shuffle(array)

    :returns: A shuffled copy of the input ``array``.

  .. js:function:: constrainedShuffle(array, constraints, [helpers={}, maxIterations=10**4, failOnMaxIterations=false])

    :param array array: Array to be shuffled
    :param constraints: Constraint specification as an object, or a check function (see below)
    :param object helpers: Optional specification of ``equality`` check or ``hash`` function used while checking constraints.
    :param int maxIterations: Maximum number of shuffle iterations to go through before giving up.
    :param Boolean failOnMaxIterations: If max iterations are reached, throws an exception if true, else warns in the console.

    :returns: A shuffled copy of the input ``array``, subject to specified constraints.

    This method will shuffle an array similar to the ``shuffle`` function described above, but will check whether constraints are met before returning the result.

    **Defining constraints**

    The ``constraints`` argument can be used to define desired properties of the shuffled result, specifically the *maximum number of repetitions* of the same value in series, and the *minimum distance between repetitions* of the same value. These are defined using the ``maxRepSeries`` and ``minRepDistance`` parameters, respectively.

    ``maxRepSeries`` restricts the number of repetitions of the same value in immediate succession. For example, ``maxRepSeries: 1`` ensures that no value appears twice in sequence::

      // Create a new RNG for demo purposes. Inside a component,
      // scripts can use the built-in RNG via this.random
      const rng = new lab.util.Random()

      rng.constrainedShuffle( // (I was a terror since the public school era)
        ['party', 'party', 'bullsh!*', 'bullsh!*'],
        { maxRepSeries: 1 }
      )
      // ➝ ['party', 'bullsh!*', 'party', 'bullsh!*']

    Similarly, ``minRepDistance`` ensures a minimum distance between successive repetitions of the same value (and implies ``maxRepSeries: 1``). Note that ``maxRepDistance: 2`` requires that there is at least one other entry in the shuffled array between subsequent repetitions of the same entry, ``3`` requires two entries in between, and so on::

      rng.constrainedShuffle(
        ['dj', 'dj', 'fan', 'fan', 'freak', 'freak'],
        { minRepDistance: 3 }
      )
      // ➝ ['dj', 'fan', 'freak', 'dj', /* ... */]

    **Custom constraint checkers**

    As an alternative to desired properties of the shuffled result, it's possible to define a custom constraint checker. This is a function that evaluates a shuffled candidate array, and returns ``true`` or ``false`` to accept or reject the shuffled candidate, depending on whether it meets the desired properties::

      // Function that evaluates to true only if
      // the first array entry matches the provided value.
      const firstThingsFirst = array => array[0] === "I'm the realest"

      rng.constrainedShuffle(
        [
          "I'm the realest",
          "givin' lessons in physics",
          "put my name in bold",
          "bring the hooks in, where the bass at?",
          // ... who dat, who dat?
        ],
        firstThingsFirst
      )
      // ➝ Shuffled result with fixed first entry

  .. js:function:: shuffleTable(table, [columnGroups=[]])

    :returns: A shuffled copy of the input ``table``.

    Shuffles the rows of a tabular data structure, optionally shuffling groups of columns independently.

    This function assumes a tabular input in the form of an ``array`` of one or more objects, each of which represents a row in the table. For example, we might imagine the following tabular input::

      const stroopTable = [
        { word: 'red',   color: 'red'   },
        { word: 'blue',  color: 'blue'  },
        { word: 'green', color: 'green' },
      ]

    Here, the ``array`` (in square brackets) holds multiple rows, which contain the entries for every column.

    This data structure is common in ``lab.js``: The entire data storage mechanism relies on it (though we hope you wouldn't want to shuffle your collected data!), and (somewhat more usefully) loops represent their iterations in this format. So you might imagine that each of the rows in the example above represents a trial in a Stroop paradigm, with a combination of word and color. However, you'd want to shuffle the words and colors independently to create random combinations. This is probably where the ``shuffleTable`` function is most useful: Implementing a complex randomization strategy.

    Invoked without further options, for example as ``shuffleTable(stroopTable)``, the function shuffles the rows while keeping their structure intact. This changes if groups of columns are singled out for independent shuffling, as in this example::

      const rng = new lab.util.Random()
      rng.shuffleTable(stroopTable, [['word'], ['color']])

    Here, the ``word`` and ``color`` columns are shuffled independently of one another: The output will have the same number of rows and columns as the input, but values that were previously in a row are no longer joined. Two more things are worth noting:

    * Any columns not specified in the ``columnGroups`` parameter are treated as a single group: They are also shuffled, but values of these columns in the same row remain intact.
    * Building on the example above, multiple columns can be shuffled together by combining their names, e.g. ``shuffleTable(stroopTable, [['word', 'duration'], ['color']])``.

  .. js:function:: uuid4()

    :returns: A `version 4 universally unique identifier`_ as a string, e.g. ``2b4a88ca-52ba-4950-9ec2-06f07f944fed``

    .. _version 4 universally unique identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
