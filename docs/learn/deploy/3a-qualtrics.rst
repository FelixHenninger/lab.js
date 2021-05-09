.. _tutorial/deploy/third-party/qualtrics:

Working with Qualtrics
======================

`Qualtrics`_ is a popular proprietary questionnaire and survey tool that is easy to pick up. Studies built with ``lab.js`` can be embedded in Qualtrics with a few simple steps; setting up the connection should take you about 10 minutes.

Before you go through the steps below, please make sure that you've :ref:`prepared your study for use in third-party tools <tutorial/deploy/third-party/prepare-experiment>`.

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
    allowfullscreen
  ></iframe>

  <!-- Adjust the page style slightly -->
  <style>
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

  const question = this;
question.hideNextButton();

// Listen for the study sending data
window.addEventListener("message", function _labjs_data_handler(event) {
	// Make sure that the event is from lab.js, then ...
	if (event.data.type === "labjs.data") {
		// Store Data in Qualtrics as Embedded Data
		// Since Qualtrics enforces a limit 20,000 characters on their variables
		// We will need to break the data into smaller parts
		// Create an ED in your survey flow called "labjs_data_size" to see the number of parts your data has
		// Then create multiple ED variables like labjs_data_part_1, labjs_data_part_2 etc. depending on the size
    		// The data is base64 encoded as ED can not store linebreaks
    		// Refer to the post processing section to access this data

		let csv_data = btoa(event.data.csv),
			max_size = 19999;

		let parts = 1;
		if (csv_data.length > max_size) {
			parts =
				Math.floor(csv_data.length / max_size) < csv_data.length / max_size
					? Math.floor(csv_data.length / max_size) + 1
					: Math.floor(csv_data.length / max_size);
		}

		for (let i = 1; i <= parts; i++) {
			let data_part = csv_data.slice(max_size * (i - 1), max_size * i);
			Qualtrics.SurveyEngine.setEmbeddedData("labjs_data_part_" + i, data_part);
		}
		Qualtrics.SurveyEngine.setEmbeddedData("labjs_data_size", parts);
		window.removeEventListener("message", _labjs_data_handler);
		question.clickNextButton();
	}
});


.. video:: 3a-qualtrics/3-connect_behavior.webm

.. caution::

  If you deploy a study to Qualtrics, please make absolutely sure that you've thoroughly checked the collected data, especially if you've made changes to the data storage code.

----

Working with the collected data
-------------------------------

After setting up the survey and study as described, and going through the survey, you should see the collected data in the 'Data & Analysis' tab. It should appear as a single column of somewhat unwieldy data, named ``labjs-data`` (unless, that is, you've changed this name).

The somewhat garbled appearance is because, like other questionnaire-focussed tools, Qualtrics enforces a wide data format, requiring a conversion step to decompress the data from ``lab.js`` before further analyses can be done. This step is also required with other, similar tools, and therefore described in the :ref:`general documentation <tutorial/deploy/third-party/postprocessing>`.

The data collected above is in encoded and in parts, therefore it needs to be merged and decoded before it can be used. Following is the code for `R` that can be used to accomplish this:

.. code-block:: R
# This is the R code to get the CSV data for an experiment conducted using lab.js on Qualtrics
# Since there is a size limit on the Emebedded Data variables, we have to split them and then store them
# CSV data also needs to be encoded in base64 to take care of line breaks

# There are two options in this code. 
# One data frame for all the responses. This adds the ResponseID variable to the CSV generated by lab.js and row binds all your responses
# One data frame per response. This creates one data frame in the global environment for each response.

library(tidyverse)
library(stringi)
library(jsonlite)

results_csv <-
    read_csv("CSV FILE OF RESPONSES FROM QUALTRICS") %>%
    select(ResponseId, contains("labjs")) %>%
    filter(stri_startswith_fixed(ResponseId, "R_")) %>%
    unite("labjs_data",
          contains("labjs_data_part_"),
          na.rm = T,
          sep = "")

# Option 1: All responses in one data frame

all_in_one <- function(res_id, base64_val) {
    as_csv <-
        base64_val %>%
        base64_dec() %>%
        rawToChar() %>%
        read_csv() %>% 
        mutate(ResponseID = res_id) %>% 
        relocate(ResponseID)

    return(as_csv)
}

one_csv <- map2_dfr(results_csv$ResponseId, results_csv$labjs_data, all_in_one)


# Option 2: One data frame per response. The name will be ResponseID from Qualtrics.

one_df_per_part <- function(res_id, base64_val) {
    as_csv <-
        base64_val %>%
        base64_dec() %>%
        rawToChar() %>%
        read_csv() %>% 
        mutate(ResponseID = res_id) %>% 
        relocate(ResponseID)
    
    assign(res_id, as_csv, 1)
}

walk2(results_csv$ResponseId, results_csv$labjs_data, one_df_per_part)






.. note::

  If you can see the experiment embedded in the survey, but aren't redirected to the next survey page after completing the experiment, or if you don't see the collected data, please make sure that your experiment doesn't get stuck on the last screen. For example, you might set a timeout on the last screen, or allow participants to respond to your goodbye message.

  Without this, Qualtrics will not count the dataset as a complete response, and will exclude it from the data export.
