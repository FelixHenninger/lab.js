// Store i/o action creator
export const updateComponent = (store, id, data) =>
  store.dispatch({
    type: 'UPDATE_COMPONENT',
    id, data,
  })
