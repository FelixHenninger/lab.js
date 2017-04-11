Data storage
============

.. _reference/data:

While the different kinds of elements are responsible for what happens on
screen, data storage collects participants' responses, records their actions,
and keeps them in store for later retrieval and export.

Collected data can have many origins and takes many forms. Different types of
data are separated into different **variables**, each of which can save a
different indicator or type of data. For example, many experiments will require
collection of observed behavior, decisions, or judgments alongside the time
participants needed to respond to the stimuli presented.
Each variable, in turn, can vary over time, taking on different **values** as
the experiment proceeds. In many cases, variables will change from screen to
screen, as every new display elicits new data to be recorded.

A :js:class:`data.Store` provides two central functions. First, it maintains the
**state** of the experiment, which is comprised of the latest value of each
variable. Second, a store archives the **history** of all variables over the
entire course of an experiment.

The entire history in ``lab.js`` is represented as a *long-form* dataset, in
which each variable is contained in a column, and the values over time are
stored in rows. All data can be exported at any time for further processing and
analysis, either as comma separated value (csv) file, or as JSON-serialized
data.

----

.. js:class:: data.Store([options])

  If a record of the generated data is required, a :js:class:`data.Store`
  object is passed to the component whose data should be captured via the
  :js:attr:`datastore <options.datastore>` option. This component will then
  commit its internal data to the store when it ends (unless instructed
  otherwise). :ref:`Flow control components <reference/flow>` automatically
  pass this setting on to nested components (see :js:attr:`handMeDowns
  <options.handMeDowns>`).

  Thus, the simplest possible way to use a data store is the following::

    // Create a new DataStore
    const ds = new lab.data.Store()

    const screen = new lab.html.Screen({
      content: 'Some information to display',
      // DataStore to send data to
      datastore: ds,
      // Additional variables to be recorded
      data: {
        'variable': 'value'
      },
      // The response will be saved automatically
      responses: {
        'keypress(Space)': 'done'
      }
    })

  This will record any data collected by the :ref:`Screen
  <reference/html/Screen>` into the newly created datastore. In addition, the
  value ``value`` will be placed in the column ``variable``.

  The stored data can then be accessed later during the experiment, for example
  as follows::

    // Download the data after the screen
    // has run its course.
    screen.on('end', () => ds.download())
    screen.run()

  This command sequence runs the screen, and executes the :js:func:`download`
  method on the :js:class:`data.Store` upon completion, causing a csv file with
  the data to be offered for download at this point. Further methods and
  options are illustrated in the following.

  **Data storage**

  .. js:function:: set(key, [value])

    Set the value of a variable or a set of variables

    The :js:func:`set` method will assign the included value to the variable
    with the name specified in the first argument::

      ds.set('condition', 'control')

    Alternatively, if an object is passed as the first argument, multiple
    variables can be set simultaneously::

      ds.set({
        'condition': 'control',
        'color': 'red'
      })

  .. js:function:: get(key)

    Get the current value of a variable

    Returns the latest value of a variable given its name.

  .. js:function:: commit([key, value])

    Commit the current set of variables to storage

    This method commits the current state of variables to the tabular long-term
    storage. Any variables that have changed since the last commit will be
    stored in a new row in the dataset.

    In addition, any values passed via the key and value parameters will be
    added to the dataset before this takes place. Arguments are treated as in
    the :js:func:`set` method.

  **Data retrieval**

  .. js:function:: show()

    Display the stored data on the console in a tabular format

    This method shows the accumulated data on the console for review and
    debugging.

  .. js:function:: keys()

    Extract all variable names

    Returns the names of all variables present in the data as an array.

    Several variables containing administrative data are pulled to the front of
    the array, and the remainder are sorted in alphabetical order.

  .. js:function:: extract(column, [senderRegExp])

    Extract all values of a single variable

    Returns all values this variable has taken over the course of the experiment
    as an array. That is, all of the states the variable was in when the data
    were committed.

    The optional argument ``senderRegExp`` takes a string or regular expression
    that is compared to the ``sender`` column in the data set (which contains
    the :js:attr:`title <options.title>` attribute of the element that
    contributed the corresponding set of data). If this option is a string, an
    exact match is performed. If it contains a regular expression, this is
    compared to the values in the ``sender`` column.

  **Data export**

  .. js:function:: exportJson()

    Export data as JSON string

    Returns a string containing the collected data encoded as a `JSON
    <http://json.org/>`_ string. The string is constructed as a JSON array which
    contains a JSON-encoded object of each row of the data.

  .. js:function:: exportCsv(separator=',')

    Export data as CSV string

    Returns a string of the data in comma separated value (CSV) format.

    The result is a string in which each data row is in a separate row, and
    columns within rows are separated by the specified separator, which is a
    comma by default.

  .. js:function:: exportBlob(filetype='csv')

    Export data as Javascript blob object

    Returns the data enclosed in a given filetype (``csv`` or ``json`` as
    described above), but as a `blob object
    <https://developer.mozilla.org/docs/Web/API/Blob>`_.


  **Data download**

  .. js:function:: download(filetype='csv', filename='data.csv')

    Download data as a file

    Initiates a download of the data in a specified format (see above) with a
    given file name.

    .. caution::

      Direct data download is **not available on all browsers** due to browser-side bugs and incompatibilities. We rely on ``FileSaver.js`` for this functionality, which excellent, but not perfect. Please consult the `FileSaver.js documentation`_ for information regarding browser support.

      .. _FileSaver.js documentation: https://github.com/eligrey/FileSaver.js/#supported-browsers

  **Data transmission**

  .. js:function:: transmit(url, metadata={}, payload='full')

    Transmit data to a given url

    Sends a HTTP ``POST`` request to the specified URL, with either the full
    dataset (default), or the currently staged data (if the ``payload`` argument
    is set to ``'staging'``) encoded as a JSON string, (under the key ``data``),
    the current page URL (as ``url``), and any additional ``metadata``
    specified in the field of the same name.

    This method returns a promise that originates from the underlying ``fetch``
    call. The promise will be rejected if no connection can be established, but
    will otherwise resolve to a ``Response`` instance representing the server's
    response. The status of the exchange can be accessed via the ``response.ok``
    attribute, or through the status code, which is available through
    ``response.code``. Please consult the `Fetch API documentation
    <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>`_ for
    additional details.

    .. caution::
      **The signature of this method may change in one of the next major
      versions** (it might be replaced with an options object, but that's not
      yet decided). We aren't quite happy with its current state -- if you have
      ideas, we'd love to hear them!

    For the most part, you will probably interact with the transmit method in a
    way similar to the following example::

      // Define server URL and metadata for the current dataset
      const storage_endpoint = 'https://awesome_lab.prestigious.edu/study/storage.php'
      const storage_metadata = {
        'participant_id': 77
      }

      // Transmit data to server
      ds.transmit(
        storage_endpoint,
        storage_metadata
      ).then(
        () => experiment.end()
        // ... thank the participant,
        // explaining that it is now possible
        // to close the browser window.
      )

    However, much more complex scenarios are possible, especially with regard
    to the detection and graceful handling of errors. These are generally
    rare, however, especially in a more controlled, laboratory, environment,
    safeguards can be helpful in case something does go wrong, as illustrated
    in the following example::

      // Assuming we have established and used the DataStore 'ds'
      ds.transmit(storage_endpoint, storage_metadata)
        .then((response) => {
            if (response.ok) {
              // All is well: The server reported a successful transmission
              experiment.end() // As a simple example of a possible reaction
            } else {
              // A connection could be established, but something went
              // wrong along the way ... let the experimenter know
              alert(
                'Transmission resulted in response' + response.code + '. ' +
                'Please download data manually.'
              )

              // Download data locally (onto lab computers)
              // If you are conducting distributed experiments online,
              // you might instead use a timeout to retry after a short
              // interval. However, errors at this stage should be a
              // very rare occurrence.
              ds.download()

              // End the experiment (as above)
              experiment.end()
            })
          .catch((error) => {
            // The connection itself failed, probably due to connectivity
            // issues. (this second part, the catch, is optional -- in may cases
            // you will not run into this situation, and if you do, there is,
            // sadly, very little that can be done. Any traditional web survey
            // will have long failed at this point)
            alert(
              'Could not establish connection to endpoint. ' +
              'ran into error ' + error.message
            )

            // Download data and end as before
            ds.download()
            experiment.end()
          })
        )
