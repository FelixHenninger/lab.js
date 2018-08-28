import { fromObject } from '../io/load'

// Load a study from a remote URL
export const fromURL = async () => {
  // Extract study URL from current location
  const location = new URL(window.location.href)

  // Stop during automated testing
  if (!location || !location.searchParams) {
    return
  }

  // Extract url parameter from path
  const url = location.searchParams.get('url')

  // Make sure URL is present and the user knows what is happening
  if (
    url &&
    window.confirm(`Would you like to load the study from ${ url }?`)
  ) {
    let response
    try {
      response = await fetch(url)
    } catch(e) {
      alert(`Connection error while trying to load remote study: ${ e }`)
      return
    }

    // Catch 404 responses, etc.
    if (!response.ok) {
      alert(`Invalid response while loading remote study, code ${ response.status }: ${ response.statusText }`)
      return
    }

    // Parse JSON
    let data
    try {
      data = await response.json()
    } catch(e) {
      alert(`Couldn't decode study data: ${ e }`)
      return
    }

    // Parse state
    const state = fromObject(data)

    // Remove URL parameter
    window.history.pushState({}, document.title, "/")

    // Return new application state
    return state
  }
}
