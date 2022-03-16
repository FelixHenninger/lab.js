// Random uuid4 generation
export const uuid4 = (random = Math.random) =>
  // This is adapted from Jed Schmidt's code,
  // which is available under the DWTFYWTPL
  // at https://gist.github.com/jed/982883
  // (there are faster and shorter implemen-
  // tations, but this one is the clearest)
  '00000000-0000-4000-8000-000000000000'.replace(/[08]/g, (v: any) =>
    (v ^ ((random() * 16) >> (v / 4))).toString(16),
  )
