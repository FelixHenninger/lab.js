Writing scripts in the builder
==============================

.. vimeo:: 250374062

.. note::
  **We've made a change in a recent version of lab.js that isn't yet reflected in the video.**

  In the video, we describe how to set parameters by assigning values to ``this.options.parameters.greeting`` to setup a parameter with the name ``greeting``.
  However, recent versions of ``lab.js`` allow you to do the same by writing ``this.parameters.greeting`` and omit the ``options`` part.

  We're highlighting this because

  * This change saves you some typing
  * You can now use ``this.parameters`` and ``this.state`` consistently both in your scripts and in placeholders elsewhere in the experiment. In either case, you can extract parameter and state values, and save data to the state.

  Following the example in the video, you could write::

    this.parameters.greeting = this.random.choice([
      'As-salāmu ʿalaykum', 'shalom'
    ])

  and extract the value thus generated on a screen or in any builder setting through the placeholder ``${ this.parameters.greeting }``. See how this saves the value and retrieves it from the same place?

  We hope that this makes things more consistent, and will update the video as soon as we get the chance. Sorry for the trouble!
