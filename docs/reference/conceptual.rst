Conceptual overview
===================

The core idea of ``lab.js`` is that experiments can be broken down into **components** that are fundamentally alike. From these building blocks, even complex experiments can then be constructed.

For example, a typical experiment can probably be broken down into several :js:class:`screens <lab.html.Screen>` which are presented to participants sequentially. These behave similarly: Each likely needs some preparation before it can be presented (e.g. preloading of content), before it can be run. It might wait for a response and then end, or terminate automatically after a certain time period, or both.

On a higher level, screens might be combined into :js:class:`sequences <lab.flow.Sequence>`: The experiment itself is most likely a sequence of screens, but on a finer level, trials are also often composed of several distinct phases that appear in sequence, for example a fixation cross that precedes stimulus presentation, and an ISI that follows it.
Sequences, too, need to be prepared (and any components they contain), and when they are run, they execute any contained content.

The two aforementioned components, :js:class:`screens <lab.html.Screen>` and :js:class:`sequences <lab.flow.Sequence>`, make up the core of lab.js. Even though they represent fundamentally different building blocks, they behave very similarly: As just noted, both are **prepared** and **run** in a similar way. In addition, they share much of the same internal structure. Specifically, both emit and are sensitive to several types of *events*, of which preparation and presentation are just two.
These similarities are reflected in the internal structure of lab.js, in which all components are descendants of the same core prototype, often with very few additional changes.
