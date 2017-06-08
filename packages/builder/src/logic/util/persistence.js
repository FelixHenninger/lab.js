export const persistState = store =>
  // Persist application state to localStorage on changes
  store.subscribe(() => {
    if (window.localStorage) {
      window.localStorage.setItem(
        'labjs:state:default',
        JSON.stringify(store.getState())
      )
    }
  })

export const retrieveState = () =>
  (window.localStorage && window.localStorage.getItem('labjs:state:default'))
    ? JSON.parse(localStorage.getItem('labjs:state:default'))
    : undefined

