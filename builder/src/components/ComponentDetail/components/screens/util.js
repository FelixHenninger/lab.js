import { connect } from 'react-redux'

// Data transformations


// Store i/o

export const wrapScreen = (screen) =>
  connect(
    (state, ownProps) => ({
      data: state.components[ownProps.id]
    })
  )(screen)

export const updateComponent = (store, id, data) =>
  store.dispatch({
    type: 'UPDATE_COMPONENT',
    id, data,
  })
