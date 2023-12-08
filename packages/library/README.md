# lab.js

**Building blocks for browser-based behavioral experiments.**

----

**`lab.js` is a tool for constructing browser-based studies** using a graphical builder interface, or through pure JavaScript code. This library is the code-based runtime that underpins all studies built using either method. You'll want to use it if you would like to program your study manually, or if you require the maximum possible flexibility. The [graphical builder](https://labjs.readthedocs.io/en/latest/learn/builder/) will get you started more quickly in most other cases.

## Installation

Static builds are available with every [release](https://github.com/FelixHenninger/lab.js/releases), and [mirrored](https://unpkg.com/lab.js) on [unpkg](https://unpkg.com).

If you use a package manager like `npm` or `yarn`, add `lab.js` to your project with one of the following commands:

```
$ npm install lab.js
$ yarn add lab.js # (alternatively)
```

## Basic usage

The idea underlying this little library is that studies are assembled from individual _components_. The simplest example might be the following:

```
// Define a component
const hello = new lab.html.Screen({
  content: 'Hello world!'
})

// Run it
hello.run()
```

Each component can [provide information to participants](https://labjs.readthedocs.io/en/latest/reference/html.html), as in the above example, or [add structure to the study](https://labjs.readthedocs.io/en/latest/reference/flow.html). Besides the content, components [coordinate user events](https://labjs.readthedocs.io/en/latest/reference/core.html#options.responses) and [collect data](https://labjs.readthedocs.io/en/latest/reference/data.html), providing the central functionality for any browser-based study. Every component can also be extended using [hooks](https://labjs.readthedocs.io/en/latest/reference/core.html#event-api) which allow custom code to be added at any point within the study.

## Further information

A `readme` like this one can only provide the most general overview. Please find all further details in the following places ...

* [Project homepage](https://lab.js.org/)
* [Library reference](https://labjs.readthedocs.io/en/latest/reference/index.html)
* [Repository](https://github.com/FelixHenninger/lab.js)
* [Contributor's guide](https://github.com/FelixHenninger/lab.js/blob/master/contributing.md)

We welcome any questions or feedback you might have, and would like to warmly invite you to [join our **slack channel**](https://slackin-numbercrunchers.herokuapp.com/) where we gladly answer your questions. Please [subscribe to our **newsletter**](http://eepurl.com/co0K9r) for occasional updates.

Finally, **we would love to have you as part of this project!** Ideas and suggestions, bug reports and code contributions are all very welcome. This is an open project, and we'd be glad to get you started if you would like to help, but are unsure how.

### Citation

We [kindly request](https://www.youtube.com/watch?v=kVwl-Va7cNM) that you cite
``lab.js`` if you use it in your research. Here's how:

> Henninger, F., Shevchenko, Y., Mertens, U. K., Kieslich, P. J., & Hilbig, B. E. (2019). lab.js: A free, open, online study builder. doi: [10.5281/zenodo.597045](https://doi.org/10.5281/zenodo.597045)

(There are also [version-specific dois](https://doi.org/10.5281/zenodo.597045) if you prefer those)
