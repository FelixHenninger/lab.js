export const serialize = function (forms: NodeListOf<HTMLFormElement>) {
  // Prepare an empty output object
  const output: { [key: string]: any } = {}

  // Iterate over forms ...
  Array.from(forms).forEach(form => {
    // ... and elements within them
    Array.from(form.elements).forEach(element => {
      // Handle the element differently depending on the tag type
      if (element instanceof HTMLInputElement) {
        switch (element.type) {
          case 'checkbox':
            output[element.name] = element.checked
            break
          case 'radio':
            if (element.checked) {
              output[element.name] = element.value
            }
            break
          // All other input types (e.g. text, hidden,
          // number, url, ... button, submit, reset)
          default:
            output[element.name] = element.value
        }
      } else if (element instanceof HTMLTextAreaElement) {
        output[element.name] = element.value
      } else if (element instanceof HTMLSelectElement) {
        switch (element.type) {
          case 'select-one':
            output[element.name] = element.value
            break
          case 'select-multiple':
            // Again, working around limitations of NodeLists
            output[element.name] = Array.from(element.options)
              .filter(option => option.selected)
              .map(option => option.value)
            break
          // no default
        }
      } // if clause
    }) // iterate across elements
  }) // iterate across forms

  return output
}
