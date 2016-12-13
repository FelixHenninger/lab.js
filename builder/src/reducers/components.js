// Define a default app state
// TODO: Think about removing the id property
// on the components; it's superfluous, but
// might be handy in the app
const defaultState = {
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: ['Experiment']
  },
  'Experiment': {
    id: 'Experiment',
    title: 'Experiment',
    type: 'lab.flow.Sequence',
    children: ['1', '2']
  },
  '1': {
    id: '1',
    title: 'Instruction',
    type: 'lab.html.Screen',
    content: 'This is some content',
  },
  '2': {
    id: '2',
    title: 'Instruction2.title',
    type: 'lab.flow.Sequence',
    content: 'This is some more content',
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
      // TODO: This doesn't account for the possibility
      // that the same component might be duplicated
      // within the same parent component -- but that's
      // pretty much hypothetical for now.
      // Solving this will require passing the index
      // along with the parent
      const componentInUse = Object.entries(state)
        .filter(([id, c]) => c.children && c.children.includes(action.id))
        .length > 1

      const output = {
        ...state,
        [action.parent]: {
          ...state[action.parent],
          children: state[action.parent].children.filter(x => x !== action.id)
        }
      }

      // If it is not used elsewhere, remove
      // the component from the state object.
      if (!componentInUse) {
        delete output[action.id]
      }

      return output
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        }
      }

    default:
      return state
  }
}
