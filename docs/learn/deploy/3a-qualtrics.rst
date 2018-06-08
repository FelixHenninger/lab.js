.. _tutorial/deploy/third-party/qualtrics:

Working with Qualtrics
======================

`Qualtrics`_ is a popular proprietary questionnaire and survey tool that is easy to pick up. Studies built with ``lab.js`` can be embedded in Qualtrics with a few simple steps; setting up the connection should take you about 10 minutes.

.. _Qualtrics: https://www.qualtrics.com

.. contents:: Steps
  :local:

----

Set up data storage
-------------------

As a first step, you'll need to create a place to store the data. In Qualtrics, most data will come from survey questions; our external study will need an *embedded data field* where it can place the collected data.

You'll can add an embedded data field in the survey flow dialogue, like this:

.. video:: 3a-qualtrics/1-embedded_data.webm

.. caution:: The following steps assume that you've called the field ``labjs-data``. If you'd prefer a different name, or if you're combining several experiments in a single survey, please adjust the JavaScript snippet below.

----

Embed the study
---------------

Next, you'll need to pull in the study you've built. As described in the introduction, you'll need to :ref:`host your study externally <tutorial/deploy/third-party>` and embed it in the survey through an ``<iframe>`` tag.

.. video:: 3a-qualtrics/2-link_study.webm

Because the data is saved in the embedded field you set up above, the study is best inserted in a `Descriptive Text` component in Qualtrics, rather than a question of its own. After you've inserted the new component, please click on its contents and change to the `HTML View` to insert the snippet below. You'll need to change the ``URL`` at the top to point to the study you'd like to embed.

.. code-block:: HTML

  <!-- Embed the study -->
  <iframe
    src="https://labjs-qualtrics.netlify.com"
    style="width: 100%; min-height: 600px; border: none;"
  ></iframe>

  <!-- Adjust the page style slightly -->
  <style>
    /* Hide button for skipping the page */
    .NextButton {
      visibility: hidden;
    }
    /* Remove border from last question */
    .QuestionOuter:last-of-type .QuestionText {
      border: none;
    }
  </style>

.. note:: Qualtrics requires that the study be accessed via an encrypted connection, so please make sure that the link you insert starts with ``https``.

----

Connect the study and the questionnaire
---------------------------------------

The next step is to link the behavior of the questionnaire and that of the study. The questionnaire should collect and store the generated data, and move to the next page after participants have completed the experiment. This requires a bit of logic, which is added to the question you created in the last step.

To achieve the connection, you'll need to add JavaScript logic to the `Descriptive Text` question, inserting the following code inside the curly braces of the ``addOnReady`` block. This snippet can stay as-is, unless you'd like to store the study data in a different embedded data field.

.. code-block:: JS

  // Listen for the study sending data
  window.addEventListener('message', function(event) {
    // Make sure that the event is from lab.js, then ...
    if (event.data.type === 'labjs.data') {
      // ... extract the data lab.js is sending.

      // We're going to work with JSON data
      const data = event.data.json

      // ... save data and submit page
      Qualtrics.SurveyEngine.setEmbeddedData('labjs-data', data)
      document.querySelector('.NextButton').click()
    }
  })

.. video:: 3a-qualtrics/3-connect_behavior.webm

----

Working with the collected data
-------------------------------

After setting up the survey and study as described, and going through the survey, you should see the collected data in the 'Data & Analysis' tab. It should appear as a single column of somewhat unwieldy data, named ``labjs-data`` (unless, that is, you've changed this name).

The somewhat garbled appearance is because, like other questionnaire-focussed tools, Qualtrics enforces a wide data format, requiring a conversion step to decompress the data from ``lab.js`` before further analyses can be done. This step is also required with other, similar tools, and therefore described in the :ref:`general documentation <tutorial/deploy/third-party/postprocessing>`.

.. caution::

  If you can see the experiment embedded in the survey, but aren't redirected to the next survey page after completing the experiment, or if you don't see the collected data, please make sure that your experiment doesn't get stuck on the last screen. For example, you might set a timeout on the last screen, or allow participants to respond to your goodbye message.

  Without this, Qualtrics will not count the dataset as a complete response, and will exclude it from the data export.