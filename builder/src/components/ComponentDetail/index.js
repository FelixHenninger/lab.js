import React from 'react'

import Sequence from './components/screens/flow/Sequence'
import Loop from './components/screens/flow/Loop'
import Screen from './components/screens/html/Screen'
import Fallback from './components/screens/Fallback'

const screens = {
  'lab.flow.Sequence': Sequence,
  'lab.flow.Loop': Loop,
  'lab.html.Screen': Screen,
}

const componentDetail = (props) => {
  let Screen
  if (props.type !== undefined) {
    Screen = screens[props.type]
  } else {
    Screen = Fallback
  }
  return <Screen id={ props.id } />
}

// Redux integration
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  const id = state.componentDetail.viewProps.id
  const type = state.components[id] ? state.components[id].type : undefined

  return {
    // The key helps when switching between components of the same type;
    // without it, the view will not change. Alternatively, the key could
    // be specified on the specific screen component in the render function
    // above, this also fixes the issue.
    key: id,
    id, type
  }
}

export default connect(mapStateToProps)(componentDetail)
