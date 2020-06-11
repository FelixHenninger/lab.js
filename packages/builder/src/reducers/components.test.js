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
      index: 1,
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
      children: ['C', 'D', 'C', 'D'],
    },
    C: {},
    D: {},
  }
  expect(updateComponent(
    state,
    {
      type: 'DELETE_COMPONENT',
      id: 'C',
      parent: 'B',
      index: 2,
    }
  )).toEqual(
    {
      root: state.root,
      A: state.A,
      B: {
        children: ['C', 'D', 'D']
      },
      C: state.C,
      D: state.D,
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

it('copies a component', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'COPY_COMPONENT',
      id: 'A',
      parent: 'B',
      index: 0,
    }
  )).toEqual(
    {
      ...initialState,
      B: {
        children: ['1'],
      },
      '1': {},
    }
  )
})

it('copies a component with children', () => {
  const state = {
    root: {
      children: ['A', 'B'],
    },
    A: {
      children: ['C'],
      thisIs: 'A'
    },
    B: {},
    C: {
      thisIs: 'C'
    },
  }

  // TODO: This is not ideal, because it relies on
  // the unique id function being called in a specific
  // order, so that the id 1 is created in the preceding
  // test, and 2 and 3 are created here. Ideally,
  // the uniqueId function would be injected into the
  // reducer, or something similar.
  expect(updateComponent(
    state,
    {
      type: 'COPY_COMPONENT',
      id: 'A',
      parent: 'B',
      index: 0,
    }
  )).toEqual(
    {
      ...state,
      B: {
        children: ['2'],
      },
      '2': {
        children: ['3'],
        thisIs: 'A',
      },
      '3': {
        thisIs: 'C',
      },
    }
  )
})

it('imports component data from external tree', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'IMPORT_COMPONENT',
      parent: 'root',
      index: 1,
      id: 'target',
      source: {
        target: {},
      },
    }
  )).toEqual({
    ...initialState,
    root: {
      children: ['A', '4', 'B', 'C'],
    },
    '4': {}
  })
})

it('imports nested components from external tree', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'IMPORT_COMPONENT',
      parent: 'root',
      index: 1,
      id: 'target',
      source: {
        target: {
          children: ['targetA', 'targetB'],
        },
        targetA: {
          children: ['targetC'],
        },
        targetB: {},
        targetC: {},
      },
    }
  )).toEqual({
    ...initialState,
    root: {
      children: ['A', '5', 'B', 'C'],
    },
    '5': {
      children: ['6', '8'],
    },
    '6': {
      children: ['7'],
    },
    '7': {},
    '8': {},
  })
})

it('adds files to a component', () => {
  expect(updateComponent(
    initialState,
    {
      type: 'ADD_FILES',
      files: [{
        component: 'A',
        localPath: 'foo.png',
        poolPath: 'bar.png',
      }]
    }
  )).toEqual({
    ...initialState,
    'A': {
      files: [
        {
          localPath: 'foo.png',
          poolPath: 'bar.png',
        }
      ]
    },
  })
})
