import React from 'react'
import { connect } from 'react-redux'

import Loop from './components/screens/flow/Loop'
import Sequence from './components/screens/flow/Sequence'
import Form from './components/screens/html/Form'
import Screen from './components/screens/html/Screen'
import Fallback from './components/screens/Fallback'
import Welcome from './components/screens/Welcome'

const screens = {
  'lab.flow.Loop': Loop,
  'lab.flow.Sequence': Sequence,
  'lab.html.Form': Form,
  'lab.html.Screen': Screen,
}

const componentDetail = (props) => {
  let Screen
  if (props.type !== undefined) {
    Screen = screens[props.type]
  } else {
    if (props.id === 'welcome') {
      // TODO: This is a huge hack;
      // the welcome screen should exist outside
      // of the component detail screen
      Screen = Welcome
    } else {
      Screen = Fallback
    }
  }
  return <Screen id={ props.id } data={ props.data } />
}

// Redux integration
const mapStateToProps = (state) => {
  const id = state.componentDetail.viewProps.id
  const type = state.components[id] ? state.components[id].type : undefined
  const data = state.components[id] ? state.components[id] : {}

  return {
    // The key helps when switching between components of the same type;
    // without it, the view will not change. Alternatively, the key could
    // be specified on the specific screen component in the render function
    // above, this also fixes the issue.
    key: id,
    id, type, data
  }
}

export default connect(mapStateToProps)(componentDetail)
