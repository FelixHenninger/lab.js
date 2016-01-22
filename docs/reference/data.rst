Data storage
============

While the different kinds of elements are responsible for what happens on
screen, data storage collects participants' responses, records their actions,
and keeps them in store for later retrieval and export.

Conceptual overview
-------------------

Collected data can have many origins and takes many forms. Different types of
data are separated into different **variables**, each of which can save a
different indicator or type of data. For example, many experiments will require
collection of observed behavior, decisions, or judgments alongside the time
required to respond to the stimuli presented.
Each variable, in turn, can vary over time, taking on different **values** as
the experiment proceeds. In many cases, variables will change from screen to
screen, as every new display elicits new data to be recorded.

Data stores provide two central functions. First, they maintain the **state** of
the experiment, which is comprised of the latest value of each variable. Second,
a store archives the **history** of all variables over the entire course of an
experiment.

The entire history in ``lab.js`` is represented as a *long-form* dataset, in
which each variable is contained in a column, and the values over time are
stored in rows. All data can be exported at any time for further processing and
analysis, either as comma separated value (csv) file, or as JSON-serialized
data.

----

Usage
-----

If a record of the generated data is required, a ``DataStore`` object is passed
to the element whose data should be captured. This element will commit its
internal data to the store when it ends (unless instructed otherwise).
:ref:`Sequences <reference/flow/sequence>` automatically pass this setting on to
their descendants.

Thus, the simplest possible way to use a ``DataStore`` is the following::

  // Create a new DataStore
  var ds = new lab.DataStore()

  var screen = new lab.HTMLScreen(
    'Some information to display',
    {
      // DataStore to send data to
      'datastore': ds,
      // Additional variables to be recorded
      'data': {
        'variable': 'value'
      },
      // The response will be saved automatically
      'responses': {
        'keypress(space)': 'done'
      }
    }
  )

This will record any data collected by the :ref:`Screen
<reference/html/HTMLScreen>` into the newly created datastore. In addition,
the value ``value`` will be placed in the column ``variable``.

The stored data can then be accessed later during the experiment, for example
as follows::

  // Download the data after the screen
  // has run its course.
  screen.run()
    .then(ds.download)

This command sequence runs the screen, and executes the ``download`` method on
the ``DataStore`` upon completion, causing a csv file with the data to be
offered for download at this point. Further methods and options are illustrated
in the following.

Methods
^^^^^^^

Data storage
............

``set(key, [value])`` · Set the value of a variable or a set of variables
  The ``set`` method will assign the included value to the variable with the
  name specified in the first argument::

    ds.set('condition', 'control')

  Alternatively, if an object is passed as the first argument, multiple
  variables can be set simultaneously::

    ds.set({
      'condition': 'control',
      'color': 'red'
    })

``get(key)`` · Get the current value of a variable
  Returns the latest value of a variable given its name.

``commit([key, value])`` · Commit the current set of variables to storage
  This method commits the current state of variables to the tabular long-term
  storage. Any variables that have changed since the last commit will be stored
  in a new row in the dataset.

  In addition, any values passed via the key and value parameters will be added
  to the dataset before this takes place. Arguments are treated as in the
  ``set`` method.

Data retrieval
..............

``show()`` · Display the stored data on the console in a tabular format
  This method shows the accumulated data on the console for review and
  debugging.

``keys()`` · Extract all variable names
  Returns the names of all variables present in the data as an array.

  Several variables containing administrative data are pulled to the front of
  the array, and the remainder are sorted in alphabetical order.

``extract(column, [sender_re])`` · Extract all values of a single variable
  Returns all values this variable has taken over the course of the experiment
  as an array. That is, all of the states the variable was in when the data
  were committed.

  The optional argument ``sender_re`` takes a string or regular expression that
  is compared to the ``sender`` column in the data set (which contains the
  ``title`` attribute of the element that contributed the corresponding set
  of data). If this option is a string, an exact match is performed. If it
  contains a regular expression, this is compared to the values in the
  ``sender`` column.

Data export
...........

``export_json()`` · Export data as JSON string
  Returns a string containing the collected data encoded as a `JSON
  <http://json.org/>`_ string. The string is constructed as a JSON array which
  contains a JSON-encoded object of each row of the data.

``export_csv(separator=',')`` · Export data as CSV string
  Returns a string of the data in comma separated value (CSV) format.

  The result is a string in which each data row is in a separate row, and
  columns within rows are separated by the specified separator, which is a
  comma by default.

``export_blob(filetype='csv')`` · Export data as Javascript blob object
  Returns the data enclosed in a given filetype (``csv`` or ``json`` as
  described above), but as a `blob object
  <https://developer.mozilla.org/docs/Web/API/Blob>`_.


Data download
.............

``download(filetype='csv', filename='data.csv')`` · Download data as a file
  Initiates a download of the data in a specified format (see above) with a
  given file name.

  In the background, this appends a link to the document body and simulates a
  click on it in order to trigger a file download.
