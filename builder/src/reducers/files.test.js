import fileReducer from './files.js'

const initialState = {
  files: {
    'foo.txt': {
      content: 'Foo bar!',
      type: 'text/plain',
    }
  },
}

it('changes file content', () => {
  expect(fileReducer(
    initialState,
    {
      type: 'UPDATE_FILE',
      file: 'foo.txt',
      data: {
        content: 'Hello Felix!',
      },
    }
  )).toEqual(
    {
      ...initialState,
      files: {
        'foo.txt': {
          content: 'Hello Felix!',
          type: 'text/plain',
        },
      },
    }
  )
})
