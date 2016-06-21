// Define the sequence of elements
// that define the experiment
var experiment = new lab.Sequence([
  new lab.HTMLScreen(
    'The experiment is running!'
  )
])

// Collect data in a central DataStore
var ds = new lab.DataStore()
experiment.datastore = ds

// Start the experiment
// (uncomment to run)
//experiment.run()
