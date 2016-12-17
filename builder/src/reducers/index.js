import { combineReducers } from 'redux'
import components from './components'
import componentDetail from '../components/ComponentDetail/reducers'

export default combineReducers({
  components,
  componentDetail,
})
