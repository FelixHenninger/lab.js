import localForage from 'localforage'
import { fromObject } from '../io/load'

const lf = localForage.createInstance({
  name: "lab.js"
})

export const persistState = async store => {
  // Persist application state to localForage on changes
  store.subscribe(() => {
    lf.setItem(
      'state:latest',
      store.getState()
    )
  })

  // Check for persistence of in-browser storage
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(persistent => {
      if (persistent) {
        console.log('Persistent storage enabled')
      } else {
        console.log('Persistent storage not permitted')
      }
    })
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
