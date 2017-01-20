export const metadata = {
  'lab.flow.Loop': {
    name: 'Loop',
    category: 'Flow',
    minChildren: 1,
    maxChildren: 1,
    defaults: {
      type: 'lab.flow.Loop',
      children: [],
      templateParameters: {
        columns: ['', ''],
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
