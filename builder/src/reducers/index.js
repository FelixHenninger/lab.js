import { combineReducers } from 'redux'
import components from './components'
import componentDetail from '../components/ComponentDetail/reducers'
import files from './files'
import modal from '../components/Modal/reducers'

export default combineReducers({
  components,
  componentDetail,
  files,
  modal,
})
