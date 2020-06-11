import { defaultState } from '../logic/components'
import { fromPairs, pick } from 'lodash'

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
        if (copiedComponent.id) copiedComponent.id = newId
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

    case 'IMPORT_COMPONENT':
      const oImport = { ...state }

      // TODO: Technical debt: This is
      // copy-pasted from above with only
      // minor modifications, and should
      // be refactored properly
      const importComponent = id => {
        const copiedComponent = { ...action.source[id] }
        const newId = uniqueId(oImport)
        if (copiedComponent.id) copiedComponent.id = newId
        if (copiedComponent.children) {
          copiedComponent.children =
            copiedComponent.children.map(importComponent)
        }
        oImport[newId] = copiedComponent
        return newId
      }

      oImport[action.parent] = {
        ...oImport[action.parent],
        children: !oImport[action.parent].children ? [importComponent(action.id)] : [
          ...oImport[action.parent].children.slice(0, action.index),
          importComponent(action.id),
          ...oImport[action.parent].children.slice(action.index),
        ]
      }

      return oImport

    case 'COLLAPSE_COMPONENT':
      if (state[action.id].children && state[action.id].children.length > 0) {
        return {
          ...state,
          [action.id]: {
            ...state[action.id],
            _collapsed: !state[action.id]._collapsed,
          }
        }
      } else {
        return state
      }

    case 'UPDATE_COMPONENT':
      if (state[action.id]) {
        return {
          ...state,
          [action.id]: {
            ...state[action.id],
            ...action.data,
          },
        }
      } else {
        console.log(`Skipping update to missing component ${ action.id }`)
        // TODO: This fallback is designed to catch a very specific bug
        // that occured when flushing pending updates to a deleted component.
        // In principle, the same issue is present with all other reducers,
        // although it is extremely unlikely to occur.
        // In the long run, it may be worthwhile moving this check into
        // component logic, or, alternatively, making it universal to
        // all actions (e.g. by checking at the top of this reducer).
        return state
      }

    case 'ADD_FILES':
      return fromPairs(
        Object.entries(state)
          .map(([id, componentState]) => {
            const newFiles = action.files.filter(f => f.component === id)

            if (newFiles.length > 0) {
              const currentFiles = state[id].files || []

              return [id, {
                ...state[id],
                files: [
                  ...currentFiles,
                  ...newFiles.map(f => pick(f, ['localPath', 'poolPath']))
                ]
              }]
            } else {
              return [id, componentState]
            }
          })
      )

    case 'UPDATE_TIMELINE_ITEM':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          timeline: state[action.id].timeline.map((item, i) => {
            if (i === action.item) {
              return {
                ...item,
                ...action.data,
              }
            } else {
              return item
            }
          })
        },
      }

    case 'ADD_PLUGIN':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          plugins: [
            ...(state[action.id].plugins || []),
            { type: action.pluginType },
          ]
        }
      }

    case 'DELETE_PLUGIN':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          plugins: (state[action.id].plugins || [])
            .filter((_, i) => i !== action.index),
        }
      }

    case 'RESET_STATE':
      return defaultState

    default:
      return state
  }
}
