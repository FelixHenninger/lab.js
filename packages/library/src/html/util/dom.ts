export const createFragment = (s: string) =>
  document.createRange().createContextualFragment(s)
