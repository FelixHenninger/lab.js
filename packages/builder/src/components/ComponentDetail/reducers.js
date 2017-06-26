const defaultState = {
  viewType: 'COMPONENT_DETAIL',
  viewProps: {
    id: 'welcome',
  },
}

export default (state=defaultState, action) => {
  switch(action.type) {
    case 'SHOW_COMPONENT_DETAIL':
      return {
        viewType: 'COMPONENT_DETAIL',
        viewProps: {
          id: action.id
        },
      }
    case 'RESET_STATE':
      return defaultState
    default:
      return state
  }
}
