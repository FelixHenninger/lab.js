import localForage from 'localforage'
import { fromJSON, fromObject } from '../io/load'

const lf = localForage.createInstance({
  name: "lab.js"
})

export const persistState = async store =>
  // Persist application state to localForage on changes
  store.subscribe(() => {
    lf.setItem(
      'state:latest',
      store.getState()
    )
  })

export const retrieveState = async () => {
  // Migrate storage from localStorage to localForage/IDB
  // TODO: Remove migration eventually (2019 release)
  const localStorage = window.localStorage
  if (localStorage && localStorage.getItem('labjs:state:default')) {
    await lf.setItem(
      'state:latest',
      fromJSON(localStorage.getItem('labjs:state:default')),
    )
    localStorage.clear()
  }

  // Load data from localForage
  const data = await lf.getItem('state:latest')

  return data
    ? fromObject(data)
    : undefined
}
