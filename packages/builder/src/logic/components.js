// Define a default app state
export const defaultState = {
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: [],
  },
}

export const metadata = {
  'lab.flow.Loop': {
    name: 'Loop',
    category: 'Flow',
    icon: 'repeat',
    minChildren: 1,
    maxChildren: 1,
    defaults: {
      type: 'lab.flow.Loop',
      children: [],
      templateParameters: {
        columns: [{ name: '', type: 'string' }, { name: '', type: 'string' }],
        rows: [ ['', ''] ],
      },
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    }
  },
  'lab.flow.Sequence': {
    name: 'Sequence',
    category: 'Flow',
    icon: 'sort-amount-asc',
    minChildren: 1,
    maxChildren: Infinity,
    defaults: {
      type: 'lab.flow.Sequence',
      children: [],
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    }
  },
  'lab.html.Form': {
    name: 'Form',
    category: 'HTML',
    icon: 'list-alt',
    minChildren: 0,
    maxChildren: 0,
    defaults: {
      type: 'lab.html.Form',
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    },
  },
  'lab.html.Screen': {
    name: 'Screen',
    category: 'HTML',
    icon: 'window-maximize',
    minChildren: 0,
    maxChildren: 0,
    defaults: {
      type: 'lab.html.Screen',
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    },
  },
}

// TODO: This is awkwardly named
export const defaults = [
  'lab.html.Screen',
  'lab.html.Form',
  'lab.flow.Sequence',
  'lab.flow.Loop',
]
