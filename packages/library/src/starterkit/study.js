// Define the sequence of components that define the study
const study = new lab.flow.Sequence({
  content: [
    new lab.html.Screen({
      content: 'The experiment is running!',
    }),
  ],
})

// Start the study (uncomment to run)
//study.run()
