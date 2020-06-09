import localForage from 'localforage'
import { debounce } from 'lodash'

import { fromObject } from '../io/load'
import { quotaExceededErrors } from './monitoring'

const lf = localForage.createInstance({
  name: "lab.js"
})

export const persistState = async store => {
  // Persist application state to localForage on changes
  store.subscribe(debounce(() => {
    lf.setItem(
      'state:latest',
      store.getState()
    ).catch(e => {
      if (quotaExceededErrors.some(message => e.message.includes(message))) {
        // TODO alert user
      } else {
        throw e
      }
    })
  }), 500)

  // Check for persistence of in-browser storage
  if (navigator.storage && navigator.storage.persist) {
    if (await navigator.storage.persisted()) {
      console.log('Persistent storage enabled')
    } else {
      console.log('Persistent storage not permitted')
    }
  } else {
    console.log('No support for persistent storage')
  }
}

export const retrieveState = async () => {
  // Load data from localForage
  const data = await lf.getItem('state:latest')

  return data
    ? fromObject(data)
    : undefined
}
