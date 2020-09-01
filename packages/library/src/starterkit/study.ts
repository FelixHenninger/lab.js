// Define the sequence of components that define the study
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'study'.
const study = new lab.flow.Sequence({
  content: [
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'lab'.
    new lab.html.Screen({
      content: 'The experiment is running!',
    }),
  ],
})

// Start the study (uncomment to run)
//study.run()
