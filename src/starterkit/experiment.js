// Define the sequence of components
// that define the experiment
var experiment = new lab.flow.Sequence({
  content: [
    new lab.html.Screen({
      content: 'The experiment is running!'
    })
  ]
})

// Collect data in a central DataStore
var ds = new lab.data.Store()
experiment.datastore = ds

// Start the experiment
// (uncomment to run)
//experiment.run()
