Conceptual overview
===================

The core idea of **lab.js** is that experiments can be broken down into
components that are fundamentally alike. These **elements** constitute building
blocks from which even complex experiments can be constructed.

For example, a typical experiment can be broken down into several **screens**
which are presented to participants sequentially. Each screen likely needs
some preparation before it can be presented (e.g. preloading of content),
before it can be run. It might wait for a response and then end, or terminate
automatically after a certain time period, or both.

On a higher level, screens might be combined into **sequences**: The experiment
itself is most likely a sequence of screens, but on a finer level, trials are
also often composed of several distinct phases that appear in sequence, for
example a fixation cross that precedes stimulus presentation, and an ISI that
follows it.
Sequences, too, need to be prepared (and any elements they contain), and when
they are run, they execute any contained content.

The two aforementioned elements, screens and sequences, make up the
core of lab.js. Even though they represent fundamentally different constructs,
they behave very similarly: As just noted, both are **prepared** and **run** in
a similar way. In addition, they share much of the same internal structure.
Specifically, both emit and are sensitive to several types of *events*, of which
preparation and presentation are just two.
These similarities are reflected in the internal structure of lab.js, in which
all elements are descendants of the same core element prototype, often with
very few additional changes.
