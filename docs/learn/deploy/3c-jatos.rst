.. _tutorial/deploy/third-party/jatos:

Collecting data with JATOS
==========================

`JATOS`_, a modest abbreviation for *Just Another Tool for Online Studies*, is much more than that -- it's a powerful, open source study hosting and data collection service that's super-easy to use and provides many useful features. Among these are an excellent integration with `Amazon Mechanical Turk`_ and support for group studies in which participants interact online.
``lab.js`` integrates seamlessly with JATOS, so that studies can be set up in seconds.

.. _JATOS: https://www.jatos.org
.. _Amazon Mechanical Turk: https://www.mturk.com/

.. contents:: Steps
  :local:

----

Importing a study to JATOS
--------------------------

To import a study to JATOS, please export it using the *JATOS integration* from the builder interface. This will provide you with a zip archive that JATOS can import directly. Here's the procedure in well under a minute:

.. video:: 3c-jatos/1-import_study.webm

----

There is no step two!
---------------------

Seriously, JATOS is that awesome. You can `run your study <http://www.jatos.org/Run-your-Study-with-Batch-Manager-and-Worker-Setup.html>`_ directly from the *Worker and Batch Manager* interface, which provides links you can distribute to participants.

With what we've discussed so far, however, we've only scratched the surface of what JATOS can do -- it's much more than a mere study runner: It will help you with participant and data management, and provides comprehensive privacy features for critical data. Please check out `the JATOS paper`_ and the `online documentation`_ for more information about its many capabilities.

.. _the JATOS paper: http://dx.doi.org/10.1371/journal.pone.0130834
.. _online documentation: http://www.jatos.org/Whats-JATOS.html

----

Post-processing the data
------------------------

Data access and download are available in JATOS via `the results interface <https://www.jatos.org/Manage-results.html>`_. For studies built with ``lab.js``, JATOS stores the raw, JSON-encoded data. The following snippet for ``R`` imports this data format for analysis.
In the resulting ``data.frame``, the JATOS participant ID is available through the ``srid`` column.

.. code-block:: R

  # This code relies on the pacman, tidyverse and jsonlite packages
  require(pacman)
  p_load('tidyverse', 'jsonlite')

  # Read the text file from JATOS ...
  read_file('jatos_results.txt') %>%
    # ... split it into lines ...
    str_split('\n') %>% first() %>%
    # ... filter empty rows ...
    discard(function(x) x == '') %>%
    # ... parse JSON into a data.frame
    map_dfr(fromJSON, flatten=T) -> data

  # Optionally save the resulting dataset
  #write_csv(data, 'labjs_data_output.csv')
