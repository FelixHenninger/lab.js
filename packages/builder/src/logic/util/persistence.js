import { fromJSON } from '../io/load'

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
    ? fromJSON(localStorage.getItem('labjs:state:default'))
    : undefined

