import React from 'react'

import Sequence from './components/screens/flow/Sequence'
import Screen from './components/screens/html/Screen'

const screens = {
  'lab.flow.Sequence': Sequence,
  'lab.html.Screen': Screen,
}

const componentDetail = (props) => {
  const Screen = screens[props.type]
  return <Screen id={ props.id } />
}

// Redux integration
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  const id = state.componentDetail.viewProps.id
  const type = state.components[id] ? state.components[id].type : undefined

  return {
    id, type
  }
}

export default connect(mapStateToProps)(componentDetail)
