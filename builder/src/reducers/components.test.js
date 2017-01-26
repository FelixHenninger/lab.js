import updateComponent from './components.js'

const initialState = {
  root: {
    children: ['A', 'B', 'C']
  },
  A: {},
  B: {},
  C: {},
}

it('adds a component at a certain position', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'ADD_COMPONENT',
      id: 'E',
      parent: 'root',
      index: 2,
      data: {
        foo: 'bar',
      },
    }
  )).toEqual(
    {
      ...initialState,
      root: {
        children: ['A', 'B', 'E', 'C'],
      },
      E: {
        foo: 'bar',
        id: 'E',
      }
    }
  )
})

it('deletes a component that occurs only a single time', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'DELETE_COMPONENT',
      id: 'B',
      parent: 'root',
    }
  )).toEqual(
    {
      root: {
        ...initialState.root,
        children: ['A', 'C'],
      },
      A: initialState.A,
      C: initialState.C,
    }
  )
})

it('removes only the reference if a component occurs more than once', () => {
  const state = {
    root: {
      children: ['A', 'B'],
    },
    A: {
      children: ['C'],
    },
    B: {
      children: ['C'],
    },
    C: {},
  }
  expect(updateComponent(
    state,
    {
      type: 'DELETE_COMPONENT',
      id: 'C',
      parent: 'A',
    }
  )).toEqual(
    {
      root: state.root,
      A: {
        children: [],
      },
      B: state.B,
      C: state.C,
    }
  )
})

it('moves a component between parents (when destination has no children)', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'MOVE_COMPONENT',
      id: 'B',
      oldParent: 'root',
      oldIndex: 1,
      newParent: 'C',
      newIndex: 0,
    }
  )).toEqual(
    {
      ...initialState,
      root: {
        children: ['A', 'C'],
      },
      C: {
        children: ['B'],
      }
    }
  )
})

it('moves a component forwards within a parent component', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'MOVE_COMPONENT',
      id: 'B',
      oldParent: 'root',
      oldIndex: 1,
      newParent: 'root',
      newIndex: 2,
    }
  )).toEqual(
    {
      ...initialState,
      root: {
        children: ['A', 'C', 'B'],
      },
    }
  )
})

it('moves a component backwards within a parent component', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'MOVE_COMPONENT',
      id: 'B',
      oldParent: 'root',
      oldIndex: 1,
      newParent: 'root',
      newIndex: 0,
    }
  )).toEqual(
    {
      ...initialState,
      root: {
        children: ['B', 'A', 'C'],
      },
    }
  )
})

it('clones a component to a new parent', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'CLONE_COMPONENT',
      id: 'A',
      parent: 'C',
      index: 0,
    }
  )).toEqual(
    {
      ...initialState,
      C: {
        ...initialState.C,
        children: ['A']
      }
    }
  )
})

it('clones a component within a parent', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'CLONE_COMPONENT',
      id: 'A',
      parent: 'root',
      index: 2,
    }
  )).toEqual(
    {
      ...initialState,
      root: {
        ...initialState.root,
        children: ['A', 'B', 'A', 'C']
      }
    }
  )
})