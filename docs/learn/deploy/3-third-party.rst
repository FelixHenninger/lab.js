Interfacing with questionnaire tools
====================================

Many researchers collect data through questionnaire or survey tools, such as `Qualtrics`_, `SoSci Survey`_, or the like. These are great for collecting questionnaire-type data, but often limited with regard to experimental research.

Studies built in ``lab.js`` integrate well with external tools, and will happily send their results to an external data collection service. This enables you to build the survey-based part of your study in the questionnaire software of your choice, while constructing the experimental part in ``lab.js``.

.. _Qualtrics: https://qualtrics.com/
.. _SoSci Survey: https://www.soscisurvey.com

----

The general idea
----------------

**Before diving into specifics which depend on the software you're working with, let's take a look at the basic ideas common to all solutions of this kind -- It's worth discussing how they work in general.**

The mechanism for collecting experimental data in a questionnaire setting is the same regardless of the specific software: Basically, we pretend that the information collected during the experiment is one large free-form answer, along all the other responses in the survey. The experiment runs inside of the questionnaire, and places its data in a text input field that is hidden to the user.

This means that you'll need a couple of things for this to work:

* **Survey software that can create hidden input fields** for you, and save the collected data.
* **A place to host your experiment files** so that the survey can embed them (a static webspace will do, you won't need ``PHP`` support), and
* **Access to the code of the survey page** that will contain your experiment so that you can embed it, and include the binding between study and survey in the ``HTML``.

Preparing the experiment
^^^^^^^^^^^^^^^^^^^^^^^^

The first step is to **prepare the experiment you've built for use within external software**. Once you have a working study, all you need to do is export it using the *generic survey software* integration. This will give you a zip file; we'd ask you to unpack and upload it to a hosting provider of your choice. From there, you should be able to run the study using your browser; please make a note of the ``URL`` at which you accessed the study.

Preparing the survey
^^^^^^^^^^^^^^^^^^^^

Inside the survey, **you'll need to add a new text input field that will serve to capture and store the experiment's data**. Because we'll fill it with lots of strange-looking experimental data, it should ideally be hidden from participants (and not limited in length). You probably know best how to create this; **we've provided pointers for a few tools we've worked with below**.

Embedding the experiment within the survey
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**The final step is to integrate the experiment within the survey**. First, we'll want the experiment to fit in the confined space of a questionnaire page.

The most straightforward way to achieve this is in a screen-in-screen approach, using an ``<iframe>`` tag. This dedicates an area on the page to a page loaded from elsewhere. This is where you'll need the link to the study you uploaded earlier: It will be the source of the ``iframe``, and referenced in the ``src`` attribute. Here's a snippet for you to use -- you'll notice that it additionally sets up the frame to use as much horizontal space as is available, and sets a minimum height to make sure the study is adequately visible.

.. code-block:: HTML

  <iframe
    src="https://example.com/link/to/study"
    style="width: 100%; min-height: 600px; border: none;"
  ></iframe>

If you include this code on a survey page, you should see the study embedded. We're almost there: the final missing step is to catch the information generated and save it.

Storing the data in the survey
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

An experiment exported for survey software and embedded in a external questionnaire will send its data to the surrounding page after when the experiment is complete. **The responsability to capture and store the data thus lies with the surrounding page that is created in the survey software**. In the case of questionnaire tools, the surrounding page needs to make sure that the data are saved within the survey.

To process and save the data, the surrounding page needs to capture the results and convert them into a format that the survey software understands. Depending on the setup of the page, it might also need to submit the page and move on to the next. This will take another small piece of code — it will look somewhat like this, depending on the specific questionnaire tool involved:

.. code-block:: HTML

  <script>
    // Listen for the study sending data
    window.addEventListener('message', (event) => {
      const data = event.json // or event.csv if you'd rather collect csv data

      // Make sure that data is included, then ...
      if (data) {
        // ... process data and submit page
      }
    })
  </script>

**The specific code that processes the data will vary depending on the questionnaire tool**. In the following, we'll describe in more detail the process in popular tools.

.. note::
  **To be continued!**

  We're actively working on this, so please check back in a bit. Also, please
  be invited to send us a line or two, we've probably got a half-baked working
  version that we can share, or we can help you get started directly.

  Sorry for the trouble!
