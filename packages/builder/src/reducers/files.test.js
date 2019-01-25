import fileReducer from './files.js'

const initialState = {
  files: {
    'foo.txt': {
      content: 'data:text/plain,Foo bar!',
    }
  },
}

// Transparent PNG image
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAY' +
            'AAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='

it('adds a file', () => {
  expect(fileReducer(
    initialState,
    {
      type: 'ADD_FILES',
      files: [{
        poolPath: 'bar.png'  ,
        data: {
          content: png,
        }
      }]
    }
  )).toEqual(
    {
      ...initialState,
      files: {
        ...initialState.files,
        'bar.png': {
          content: png,
        }
      }
    }
  )
})

it('changes file content', () => {
  expect(fileReducer(
    initialState,
    {
      type: 'UPDATE_FILE',
      file: 'foo.txt',
      data: {
        content: 'data:,Hello Felix!',
      },
    }
  )).toEqual(
    {
      ...initialState,
      files: {
        'foo.txt': {
          content: 'data:,Hello Felix!',
        },
      },
    }
  )
})
