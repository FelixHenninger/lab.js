import { combineReducers } from 'redux'
import version from './version'
import components from './components'
import componentDetail from '../components/ComponentOptions/reducers'
import files from './files'
import modal from '../components/Modal/reducers'

// This is an awesome solution to overwriting
// the entire app state, due to Dan Abramov
// (https://github.com/reactjs/redux/pull/658#issuecomment-136485851)
const makeHydratable = (reducer, hydrateActionType) => {
  return function (state, action) {
    switch (action.type) {
      case hydrateActionType:
        return reducer(action.state, action)
      default:
        return reducer(state, action)
    }
  }
}

export default makeHydratable(combineReducers({
  version,
  components,
  componentDetail,
  files,
  modal,
}), 'HYDRATE')
