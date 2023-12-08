import { Store } from 'lab.js/data'
import { Loop, Sequence } from 'lab.js/flow'
import { Screen } from 'lab.js/html'

import welcomePage from './pages/1-welcome.html?raw'
import summaryPage from './pages/2-summary.html?raw'
import trialPage from './pages/3-trial.html?raw'
import interludePage from './pages/4-interlude.html?raw'
import thanksPage from './pages/5-thanks.html?raw'

import 'lab.js/css'

// Define a template for a stroop trial
const trialTemplate = new Sequence({
  content: [
    // Fixation cross ----------------------------------------------------------
    // This screen uses the trial page template,
    // but substitutes a gray plus as a fixation cross
    new Screen({
      content: trialPage,
      parameters: {
        color: 'gray',
        word: '+',
        weight: 'normal',
      },
      // Display the fixation cross for 500ms
      timeout: 500,
    }),
    // Trial screen ------------------------------------------------------------
    // This is the central screen in the experiment:
    // the display that participants respond to.
    new Screen({
      // This screen is assigned a title,
      // so that we can recognize it more easily
      // in the dataset.
      title: 'StroopScreen',
      // Again, we use the trial page template
      content: trialPage,
      parameters: {
        // Color and displayed word
        // are determined by the trial
        weight: 'bold',
      },
      // Each possible color response is
      // associated with a key
      responses: {
        'keypress(r)': 'red',
        'keypress(g)': 'green',
        'keypress(b)': 'blue',
        'keypress(o)': 'orange',
      },
      // The display terminates after 1500ms
      timeout: 1500,
      // Because the color is set dynamically,
      // we need to set the correct response by hand
      messageHandlers: {
        'before:prepare': function () {
          // Set the correct response
          // before the component is prepared
          this.options.correctResponse = this.aggregateParameters.color
        },
      },
    }),
    // Feedback (or empty) screen ----------------------------------------------
    new Screen({
      content: trialPage,
      parameters: {
        color: 'gray',
        word: '', // This is a placeholder, we generate the word below
        weight: 'normal',
      },
      // Because feedback can only be given after
      // the choice has been recorded, this component
      // is prepared at the last possible moment.
      tardy: true,
      // Generate feedback
      messageHandlers: {
        'before:prepare': function () {
          if (this.aggregateParameters.feedback) {
            // Generate feedback if requested
            this.options.timeout = 1000

            // First, check if the participant responded in time at all
            if (this.options.datastore.state['ended_on'] === 'response') {
              // If there is a response, check its veracity
              if (this.options.datastore.state['correct'] === true) {
                this.options.parameters.word = 'Well done!'
              } else {
                this.options.parameters.word =
                  'Please respond as quickly and accurately as you can!'
              }
            } else {
              // If no response was given, poke participants to speed up
              this.options.parameters.word = 'Can you go faster?'
            }
          } else {
            // If no feedback is shown, shorten the inter-trial interval
            this.options.timeout = 500
          }
        },
      },
    }),
  ],
})

// Define the trials in terms of the central parameters:
// The word shown on screen, and its color
const trials = [
  { color: 'red', word: 'red' },
  { color: 'red', word: 'green' },
  { color: 'red', word: 'blue' },
  { color: 'red', word: 'orange' },
  { color: 'green', word: 'red' },
  { color: 'green', word: 'green' },
  { color: 'green', word: 'blue' },
  { color: 'green', word: 'orange' },
  { color: 'blue', word: 'red' },
  { color: 'blue', word: 'green' },
  { color: 'blue', word: 'blue' },
  { color: 'blue', word: 'orange' },
  { color: 'orange', word: 'red' },
  { color: 'orange', word: 'green' },
  { color: 'orange', word: 'blue' },
  { color: 'orange', word: 'orange' },
]

// With the individual components in place,
// now put together the entire experiment
const experiment = new Sequence({
  content: [
    // Initial instructions
    new Screen({
      content: welcomePage,
      responses: {
        'keypress(Space)': 'continue',
      },
    }),
    // Instruction summary
    new Screen({
      content: summaryPage,
      responses: {
        'keypress(Space)': 'continue',
      },
    }),
    // Practice trials
    new Loop({
      template: trialTemplate,
      templateParameters: trials,
      shuffle: true,
      parameters: {
        feedback: true,
      },
    }),
    // Interlude
    new Screen({
      content: interludePage,
      responses: {
        'keypress(Space)': 'continue',
      },
    }),
    // Actual trials
    new Loop({
      template: trialTemplate,
      templateParameters: trials,
      shuffle: true,
      parameters: {
        feedback: false,
      },
    }),
    // Thank-you page
    new Screen({
      content: thanksPage,
      // Respond to clicks on the download button
      events: {
        'click button#download': function () {
          this.options.datastore.download()
        },
      },
    }),
  ],
  datastore: new Store(),
})

// Go!
experiment.run()
