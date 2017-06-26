const defaultState = {
  modalType: null,
  modalProps: {},
}

export default (state=defaultState, action) => {
  switch(action.type) {
    case 'SHOW_MODAL':
      return {
        modalType: action.modalType,
        modalProps: action.modalProps
      }
    case 'HIDE_MODAL':
    case 'RESET_STATE':
      return defaultState
    default:
      return state
  }
}
