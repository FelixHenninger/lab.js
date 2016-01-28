.. _teach:

Teaching with lab.js
====================

One of the original motivations in building lab.js was to provide a tool for
teaching: It was initially designed as part of the first author's course on
Methods in Cognitive Psychology, taught to first-semester master students at the
University of Koblenz-Landau.

If you are interested in teaching with lab.js, please be invited to contact the
first author, who is happy to share course material and additional pointers. If
you have considered using the library in class, or have actually employed it,
we would be thrilled to hear from your experience and gladly receive any
feedback you have.

----

Why use lab.js in class?
------------------------

As noted above, the library was built for a graduate-level seminar on browser
based (cognitive) experiments. The syllabus focussed on building these
experiments from the ground up, starting with HTML, CSS and finally Javascript.
The students, in general, responded very well to the intensely technical course,
and enjoyed building experiments with web technologies. By the end of the
semester-long weekly course, students were able to build basic experiments by
themselves using the elements provided in the library, though delving further
into the details and features of Javascript (custom functions in particular)
proved to be overly challenging. The author confesses to having had unrealistic
plans given the limited time frame, but was, upon reflection, still impressed by
the progress the students made given their very limited exposure to programming
prior to the course.

Still, because the library was built for teaching, we maintain that it provides
some unique features that make it particularly suited for use in class relative
if pure Javascript experiments are the focus. First, it introduces much of
Javascript's syntax in a natural way, and exposes users to different data types,
variables, collections of data (lists and objects), and object-oriented
programming style (rather than some arbitrary declarative syntax). It also lends
itself to functional programming, using maps to translate lists of stimuli
into screen elements, however this should be taught only if the time or prior
experience of students permit discussion of these advanced topics.
While the library exposes users to a wider range of Javascript concepts, it
strongly encapsulates and therefore hides browser-specific parts of Javascript,
in particular any manipulation of the Document Object Model (DOM). This allows
the focus to remain on the general concepts used while programming instead of
the (verbose) DOM API.

Generalizability of knowledge
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We feel strongly that the terminology and concepts should generalize beyond the
confines of this particular library. We cannot foresee the methods and tools
that our students will encounter over the course of their careers, and believe
that a cookbook-style course limited to a single library or a commercial
experimental software would do our students a disservice in the long run.

Because we teach psychological concepts (and review experimental methodology)
alongside programming, we have attempted to match the vocabulary used in both
domains. This particularly concerns the subdivision of an experiment into
recurring sequences, units that handle stimulus display and flow control, and
the hierarchical nesting of building blocks.
Similarly, we have adopted ideas and nomenclature from our experience with other
experimental software (particularly `OpenSesame <http://osdoc.cogsci.nl/>`_),
hoping that students will be able to transfer their knowledge should they
encounter different tools in the future.

Broad applicability
^^^^^^^^^^^^^^^^^^^

Students in our classrooms have chosen an elective course in cognitive
psychology, but often focus on very different fields within psychology, both
basic and applied. We feel that a good course should not only cater to students
interested in basic research, and emphasize general experimental methods and the
value of considering cognitive processes alongside specific results from
cognitive psychology.
The library assists us and our students by allowing for the easy construction
not only of experiments, but also of questionnaires and simple presentations.
As a web-based framework, it is not bound to the laboratory, but can also be
used in the field, from mobile devices, as well as participants' own hardware.

----

Reflections on library design and pedagogy
------------------------------------------

The origin of the library has heavily influenced its design. Specifically, in
teaching, we attempt to strike a balance between, on one hand, giving students
tailored tools to build experiments very quickly (so as not to overload students
with technical information, to retain focus on the psychological content of the
course, and provide students with the sense of achievement vital to technical
work) and, on the other, teaching skills and knowledge that carry further than
the specifics of the library itself, so as not to limit the course to
cookbook-style programming.

Because the experiments are provided online and run in the browser, the course
as well as the library itself require and thus convey basic knowledge of the
technology underlying the web, such as ``HTML`` and ``CSS``, and some basic
general-purpose programming concepts such as variables, lists and functions.
In our experience, demonstrating that the new skills are useful beyond the
narrow domain of constructing experiments helps to increase and maintain
students' motivation.
