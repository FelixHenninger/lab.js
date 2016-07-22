// JQuery emulation
export const domSelect = (selector, parent=document) => {
  // If the selection occurs by id,
  // use getElementById, or querySelectorAll otherwise
  const selectorType = selector.indexOf('#') === 0 ?
    'getElementById' : 'querySelectorAll'

  // If we are using getElementById, remove
  // the leading '#' from the selector
  if (selectorType === 'getElementById') {
    selector = selector.substr(1, selector.length)
  }

  // Apply the appropriate selector to the
  // parent element
  return parent[selectorType](selector)
}
