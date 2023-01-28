// Seed generation
// This is adapted from the seedrandom implementation,
// but (drastically) simplified at the cost of node.js
// and legacy browser compatibility
export const autoSeed = (width = 256) => {
  // Create and fill an array of random integers
  const output = new Uint8Array(width)
  window.crypto.getRandomValues(output)

  // Output as string of (UTF-16) characters
  return String.fromCharCode.apply(null, output as unknown as Array<number>)
}
