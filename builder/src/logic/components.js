export const metadata = {
  'lab.flow.Sequence': {
    name: 'Sequence',
    category: 'Flow',
    minChildren: 1,
    maxChildren: Infinity,
    defaults: {
      type: 'lab.flow.Sequence',
      children: [],
      responses: {
        rows: [ ['', '', '', ''] ],
      },
    }
  },
  'lab.flow.Loop': {
    name: 'Loop',
    category: 'Flow',
    minChildren: 1,
    maxChildren: 1,
    defaults: {
      type: 'lab.flow.Loop',
      children: [],
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      templateParameters: {
        columns: ['', ''],
        rows: [ ['', ''] ],
      },
    }
  },
  'lab.html.Screen': {
    name: 'Screen',
    category: 'HTML',
    minChildren: 0,
    maxChildren: 0,
    defaults: {
      type: 'lab.html.Screen',
      responses: {
        rows: [ ['', '', '', ''] ],
      },
    },
  },
}
