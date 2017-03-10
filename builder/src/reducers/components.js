// Define a default app state
// TODO: Think about removing the id property
// on the components; it's superfluous, but
// might be handy in the app
const defaultState = {
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: [],
  },
}

// Provide unique ids for individual components
let idCounter = 0
const uniqueId = function(state={}) {
  // Collect previously used ids
  const usedIds = Object
    .entries(state)
    .map( ([k, v]) => k )

  // Generate as yet unused candidate
  let candidate
  do {
    candidate = (++idCounter).toString()
  } while (usedIds.includes(candidate))

  return candidate
}

// Define reducers that operate
// on the main study representation

// TODO: Refactor this so that the children
// arrays are handled by their own reducers,
// making this code more legible
export default (state=defaultState, action) => {
  switch (action.type) {
    case 'MOVE_COMPONENT':
      if (action.oldParent === action.newParent) {
        // Remove component from old position
        const childrenStepOne = [
          ...state[action.newParent].children.slice(0, action.oldIndex),
          ...state[action.newParent].children.slice(action.oldIndex + 1)
        ]

        // Add component in new position
        const childrenStepTwo = [
          ...childrenStepOne.slice(0, action.newIndex),
          action.id,
          ...childrenStepOne.slice(action.newIndex),
        ]

        return {
          ...state,
          [action.newParent]: {
            ...state[action.newParent],
            children: childrenStepTwo
          }
        }
      } else {
        return {
          ...state,
          // Add component in new position
          [action.newParent]: {
            ...state[action.newParent],
            children: !state[action.newParent].children ? [action.id] : [
              ...state[action.newParent].children.slice(0, action.newIndex),
              action.id,
              ...state[action.newParent].children.slice(action.newIndex),
            ]
          },
          // Remove component from old position
          [action.oldParent]: {
            ...state[action.oldParent],
            children: [
              ...state[action.oldParent].children.slice(0, action.oldIndex),
              ...state[action.oldParent].children.slice(action.oldIndex + 1),
            ]
          },
        }
      }
    case 'ADD_COMPONENT':
      const componentData = {
        id: action.id || uniqueId(state),
        ...action.data,
      }
      return {
        ...state,
        [componentData.id]: componentData,
        [action.parent]: {
          ...state[action.parent],
          children: !state[action.parent].children ? [componentData.id] : [
            ...state[action.parent].children.slice(0, action.index),
            componentData.id,
            ...state[action.parent].children.slice(action.index),
          ]
        }
      }
    case 'DELETE_COMPONENT':
      // Check whether the the component is
      // in use in more than one place.
      // TODO: The following lines count the
      // instances of a given id in the entire
      // study, and might profitably be extracted
      // into the app logic (e.g. as a
      // componentInstances function), someday.
      // TODO: This does not remove nested
      // components, however they are filtered
      // when the study is saved.
      const componentInUse = 1 < Object.entries(state)
        .reduce(
          (count, [id, c]) => count +
            (c.children ? c.children.filter(x => x === action.id).length : 0),
          0
        )

      const output = {
        ...state,
        [action.parent]: {
          ...state[action.parent],
          children: state[action.parent].children.filter(
            (id, index) => !(id === action.id && index === action.index)
          )
        }
      }

      // If it is not used elsewhere, remove
      // the component from the state object.
      if (!componentInUse) {
        delete output[action.id]
      }

      return output

    case 'CLONE_COMPONENT':
      return {
        ...state,
        [action.parent]: {
          ...state[action.parent],
          children: !state[action.parent].children ? [action.id] : [
              ...state[action.parent].children.slice(0, action.index),
              action.id,
              ...state[action.parent].children.slice(action.index),
            ]
        }
      }

    case 'COPY_COMPONENT':
      const o = { ...state }

      const copy = id => {
        const copiedComponent = { ...o[id] }
        const newId = uniqueId(o)
        if (copiedComponent.children) {
          copiedComponent.children =
            copiedComponent.children.map(copy)
        }
        o[newId] = copiedComponent
        return newId
      }

      o[action.parent] = {
        ...o[action.parent],
        children: !o[action.parent].children ? [copy(action.id)] : [
          ...o[action.parent].children.slice(0, action.index),
          copy(action.id),
          ...o[action.parent].children.slice(action.index),
        ]
      }

      return o

    case 'UPDATE_COMPONENT':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        }
      }

    case 'RESET_STATE':
      return defaultState

    default:
      return state
  }
}
