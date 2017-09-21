// Define a default app state
export const defaultState = {
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: [],
    plugins: [
      {
        type: 'lab.plugins.Metadata',
      },
    ],
  },
}

const defaultTabs = [
  'Notes',
  'Content',
  'Responses',
  'Scripts',
  'More',
]

export const metadata = {
  'lab.flow.Loop': {
    name: 'Loop',
    description: 'Repeat a component',
    category: 'Flow',
    icon: 'repeat',
    minChildren: 1,
    maxChildren: 1,
    tabs: defaultTabs,
    defaultTab: 'Content',
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
    description: 'Show components sequentially',
    category: 'Flow',
    icon: 'sort-amount-asc',
    minChildren: 1,
    maxChildren: Infinity,
    tabs: defaultTabs,
    defaultTab: 'Content',
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
    description: 'Collect HTML form data',
    category: 'HTML',
    icon: 'list-alt',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
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
    description: 'Show content using HTML',
    category: 'HTML',
    icon: 'window-maximize',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
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
  'lab.canvas.Screen': {
    name: 'Screen',
    description: 'Show content using a canvas',
    category: 'Canvas',
    icon: 'picture-o',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.canvas.Screen',
      content: [],
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
      viewport: [800, 600],
    },
  },
}

export const defaultTab = (tab, type) => {
  if (tab && metadata[type].tabs.includes(tab)) {
    return tab
  } else if (type) {
    return metadata[type].defaultTab
  } else {
    return undefined
  }
}

// TODO: This is awkwardly named
export const defaults = [
  'lab.canvas.Screen',
  'lab.html.Screen',
  'lab.flow.Sequence',
  'lab.flow.Loop',
]

export const getMetadataByCategory = () =>
  Object.entries(metadata)
    .reduce((output, [type, d]) => {
      output[d.category] = [...(output[d.category] || []), type]
      return output
    }, {})
