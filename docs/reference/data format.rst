Data format
===========

.. raw:: html

  <style type="text/css">
    li > code:first-child {
      font-weight: bold;
      /* Slightly darker red */
      color: #c74032 !important;
    }
  </style>

Most studies built with ``lab.js`` use a very similar data structure. We hope that, once you're familiar with the general setup, you'll find your way around all kinds of different studies easily. Among general features you'll encounter are the following:

* **One line per component**: Every component in a study is represented in the data by a single line that contains all of the information pertaining to that component. This line is saved when the study moves beyond the component. Thus, data is written not only when a :js:class:`screen <canvas.Screen>`'s presentation is over, but also when a :js:class:`loop <flow.Loop>` or :js:class:`sequence <flow.Sequence>` come to their end.
* **Log all available information**: We tend to err on the side of saving too much data, and rely on you to filter the relevant parts in the analysis. In our experience, you can never have enough records for an experiment!

In the following, we'll walk you through the columns that are present in a typical study.

----

Default columns
---------------

For a line that represents a component, the following columns contain **metadata** that contextualizes the remaining information in the row:

* ``sender`` reflects the component's **title**.
* ``sender_type`` contains the **type** of the component that collected the data. It stores both the part of the library that the component comes from, and the type of component itself, separated by a period. Values you might see, for example, are ``canvas.Screen``, ``html.Form`` or ``flow.Sequence``
* ``sender_id`` represents the **position** of the component in the experiment's timeline. This might seem confusing at first, because it reflects the studies' nested structure. The first component in the experiment (e.g. an instruction screen at the beginning) will receive the number ``0``, and a :js:class:`loop <flow.Loop>` following it the number ``1``. However, inside of the :js:class:`loop <flow.Loop>` or :js:class:`sequence <flow.Sequence>`, the counter starts anew, so the first repetition would be represented as ``1_0``, the second as ``1_1``, and so on. If you have a :js:class:`sequence <flow.Sequence>` inside of the :js:class:`loop <flow.Loop>`, the first screen inside of that :js:class:`sequence <flow.Sequence>` would be ``1_0_0`` when it's shown for the first time, ``1_1_0`` when it is displayed for the second time, and so on.
* ``timestamp`` contains the absolute **time** at which the data were recorded. This column uses the `ISO 8601`_ date format.
* ``meta`` is added by the :js:class:`Metadata <plugins.Metadata>` plugin, and records the ``URL`` used to access the study, as well as **technical information** about the participant's browser, screen size, and language settings. This information is encoded as `JSON`_ so as not to clutter the remaining columns. There is usually a single entry in this column at the beginning of the study.

The remaining columns reflect **participants' behaviour**:

* ``response`` encodes the response chosen by the participant, or more specifically the **label** associated with this response.
* ``correctResponse`` contains the **normative response**, if one is specified.
* ``correct`` compares the previous two values, and indicates whether they match.
* ``duration`` reflects the **time for which a component was active** (in milliseconds). If a timeout was set, this shows for how long a component was presented; if the component ended because the participant responded, it will measure the time from stimulus presentation to response.
* ``ended_on`` separates the **ways in which a component can end**: It might have been because a ``response`` was recorded, or that the component was terminated by a ``timeout``; less commonly, the component might have been ``skipped`` or ``aborted``. :js:class:`Sequences <flow.Sequence>`, :js:class:`loops <flow.Loop>` and other flow control components end when their content is ``completed``.

We are meticulous about recording **timestamps** during the study, which as measured as milliseconds since the page load. They get their own columns:

* ``time_run`` when a component is presented
* ``time_render`` records the frame at which information is shown
* ``time_end`` when it ends. If a response was recorded, this reflects the time of the response as closely as possible (``duration`` is computed from the difference between this and ``time_run`` or ``time_render``, if available)
* ``time_commit`` when the data was saved to the :js:class:`data store <data.Store>`

Additional information
----------------------

Besides the columns described above (which should be present in any study), additional columns are create for all **parameters** you add to your study. That is, all `loop variables` and `task parameters` you vary during the study are logged in all components for which they are active.

.. _JSON: https://en.wikipedia.org/wiki/JSON
.. _ISO 8601: https://en.wikipedia.org/wiki/ISO_8601
