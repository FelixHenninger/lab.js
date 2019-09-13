.. _tutorial/deploy/third-party/openlab:

Managing studies with Open Lab
==============================

`Open Lab`_ is a web application that makes study hosting easy and aims to provide a secure framework for data collection. Its direct integration with ``lab.js`` makes deploying your study a breeze.

.. _Open Lab: https://open-lab.online

.. contents:: Steps
  :local:

----

Exporting a task to Open Lab
----------------------------

To export a task to Open Lab, please select the *Upload to Open Lab...* option in the builder interface. After confirming the upload, you'll see a button that allows you to manage the task within Open Lab. Clicking it will take you to the Open Lab site, where you can add further configuration options. If you aren't already, you may have to log into the Open Lab system or create a new account.

.. video:: 3d-openlab/1-upload_test.webm

----

Running your study
------------------

To create a new study, navigate to the *Studies* tab in Open Lab, where you will find a *New study* section. Give your study a name, click ``Enter``, and continue to the *Select tasks* tab. The empty panel at the top represents your study (currently devoid of tasks), whereas the available tasks are listed toward the bottom of the page.
Add the task you previously uploaded to the study by clicking the green plus on the corresponding task card. Your study is now ready to go, and you can find links to distribute to your participants on the *Invitations* tab.

.. video:: 3d-openlab/2-create_study.webm

Working with data
-----------------

The participants' data can be found in the *Data* tab. You can download data as ``CSV`` files, optionally filtered by participant or task. The *Participants* page shows the table of all participants, allowing you to inspect or export the data for any participant. On the *Results by task* page, you can select data for any of the tasks in your study.

Open Lab supports collaboration on studies, as well as the re-use and adaptation of pre-made tasks. It can also manage participants, by distributing invitations and scheduling notifications for repeated participation. For more information, please consult the `documentation`_, or visit the publicly available `library`_ of tasks.

.. _documentation: https://open-lab.online/docs/intro
.. _library: https://open-lab.online/listing
