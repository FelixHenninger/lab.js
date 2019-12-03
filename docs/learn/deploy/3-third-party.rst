Interfacing with third-party tools
==================================

Many researchers collect data through questionnaire or survey tools, such as `Qualtrics`_, `SoSci Survey`_, or the like. These are great for collecting questionnaire-type data, but often limited with regard to experimental research.

Studies built in ``lab.js`` integrate well with external tools, and will happily send their results to an external data collection service. This enables you to build the survey-based part of your study in the questionnaire software of your choice, while constructing the experimental part in ``lab.js``.

.. _Qualtrics: https://qualtrics.com/
.. _SoSci Survey: https://www.soscisurvey.com

.. contents:: Steps
  :local:

.. seealso::

  This page covers integration with third-party tools in general. We cover the most popular tools individually:

  * :ref:`Open Lab <tutorial/deploy/third-party/jatos>`
  * :ref:`JATOS <tutorial/deploy/third-party/openlab>`
  * :ref:`Qualtrics <tutorial/deploy/third-party/qualtrics>`
  * :ref:`The Experiment Factory <tutorial/deploy/third-party/expfactory>`

----

.. _tutorial/deploy/third-party:

**Before diving into specifics which depend on the software you're working with, let's take a look at the basic ideas common to all solutions of this kind -- It's worth discussing how they work in general.**

The mechanism for collecting experimental data in a questionnaire setting is the same regardless of the specific software: Basically, we pretend that the information collected during the experiment is one large free-form answer, along all the other responses in the survey. The experiment runs inside of the questionnaire, and places its data in a text input field that is hidden to the user.

This means that you'll need a couple of things for this to work:

* **Survey software that can create hidden input fields** for you, and save the collected data.
* **A place to host your experiment files** so that the survey can embed them (a static webspace will do, you won't need ``PHP`` support), and
* **Access to the code of the survey page** that will contain your experiment so that you can embed it, and include the binding between study and survey in the ``HTML``.

----

Prepare the experiment
----------------------

The first step is to **prepare the experiment you've built for use within external software**. Once you have a working study, all you need to do is export it using the *generic survey software* integration. This will give you a zip file; we'd ask you to unpack and upload it to a hosting provider of your choice. From there, you should be able to run the study using your browser; please make a note of the ``URL`` at which you accessed the study.

----

Prepare the survey
------------------

Inside the survey, **you'll need to add a new text input field that will serve to capture and store the experiment's data**. Because we'll fill it with lots of strange-looking experimental data, it should ideally be hidden from participants (and not limited in length). You probably know best how to create this; **we've provided pointers for a few tools we've worked with below**.

----

Embed the experiment within the survey
--------------------------------------

**The final step is to integrate the experiment within the survey**. First, we'll want the experiment to fit in the confined space of a questionnaire page.

The most straightforward way to achieve this is in a screen-in-screen approach, using an ``<iframe>`` tag. This dedicates an area on the page to a page loaded from elsewhere. This is where you'll need the link to the study you uploaded earlier: It will be the source of the ``iframe``, and referenced in the ``src`` attribute. Here's a snippet for you to use -- you'll notice that it additionally sets up the frame to use as much horizontal space as is available, and sets a minimum height to make sure the study is adequately visible.

.. code-block:: HTML

  <iframe
    src="https://example.com/link/to/study"
    style="width: 100%; min-height: 600px; border: none;"
  ></iframe>

If you include this code on a survey page, you should see the study embedded. We're almost there: the final missing step is to catch the information generated and save it.

----

Store the data in the survey
----------------------------

An experiment exported for survey software and embedded in a external questionnaire will send its data to the surrounding page after when the experiment is complete. **The responsability to capture and store the data thus lies with the surrounding page that is created in the survey software**. In the case of questionnaire tools, the surrounding page needs to make sure that the data are saved within the survey.

To process and save the data, the surrounding page needs to capture the results and convert them into a format that the survey software understands. Depending on the setup of the page, it might also need to submit the page and move on to the next. This will take another small piece of code — it will look somewhat like this, depending on the specific questionnaire tool involved:

.. code-block:: HTML

  <script>
    // Listen for the study sending data
    window.addEventListener('message', (event) => {
      // Make sure that the event is from lab.js, then ...
      if (event.data.type === 'labjs.data') {
        // ... extract the data lab.js is sending.

        // The collected data is available via:
        // - event.data.json for json-encoded data
        // - event.data.csv for csv-formatted data
        // - event.data.raw for the raw data array
        const data = event.data.csv

        // ... process data and submit page
        // (the specific code here will depend on the tool
        // you're using to process and store the data)
        // ...
      }
    })
  </script>

----

.. _tutorial/deploy/third-party/postprocessing:

Process the collected data
--------------------------

Many third-party tools, and specifically those that are focussed on questionnaires, limit every participant's data to a single row, enforcing a *wide* data format. This is at odds with most experimental data, where every dataset occupies many rows, resulting in a *long*-format dataset.

Because of this restriction, ``lab.js`` may need to store all of the collected data in a single data cell for it to be compatible with other tools. We typically use the `JSON`_ encoding for this task, which may look unfamiliar at first, but is an established format for storing complex data structures.

Prior to analysis, it's often useful to reverse this compression, and restore the full tabular dataset you're probably used to getting from your experimental software. Thankfully, all major analysis tools can deal with JSON easily. We collect `scripts for various tools`_, such as the following one for the ``R`` programming language.

.. _JSON: https://en.wikipedia.org/wiki/JSON
.. _scripts for various tools: https://github.com/FelixHenninger/lab.js/tree/master/utilities

.. code-block:: R

  # This code relies on the pacman, tidyverse and jsonlite packages
  require(pacman)
  p_load('tidyverse', 'jsonlite')

  # We're going to assume that the data coming from
  # the third-party tool has been loaded into R,
  # for example from a CSV file.
  data_raw <- read_csv('raw_data_from_external_tool.csv')

  # Please also check that any extraneous data that
  # an external tool might introduce are stripped
  # before the following steps. For example, Qualtrics
  # introduces two extra rows of metadata after the
  # header. Un-commenting the following command removes
  # this line and re-checks all column data types.
  #data_raw <- data_raw[-c(1, 2),] %>% type_convert()

  # One of the columns in this file contains the
  # JSON-encoded data from lab.js
  labjs_column <- 'labjs-data'

  # Unpack the JSON data and discard the compressed version
  data_raw %>%
    # Provide a fallback for missing data
    mutate(
      !!labjs_column := recode(.[[labjs_column]], .missing='[{}]')
    ) %>%
    # Expand JSON-encoded data per participant
    group_by_all() %>%
    do(
      fromJSON(.[[labjs_column]], flatten=T)
    ) %>%
    ungroup() %>%
    # Remove column containing raw JSON
    select(-matches(labjs_column)) -> data

  # The resulting dataset, available via the 'data'
  # variable, now contains both the experimental
  # data collected by lab.js, as well as any other
  # columns introduced by the software that collected
  # the data. Values from the latter are repeated
  # to fill added rows.

  # As a final step, you might want to save the
  # resulting long-form dataset
  #write_csv(data, 'labjs_data_output.csv')




