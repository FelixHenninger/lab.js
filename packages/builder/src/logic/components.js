// Define a default app state
export const defaultState = {
  'root': {
    id: 'root',
    title: 'root',
    type: 'lab.flow.Sequence',
    children: [],
    parameters: {
      rows: [ [ { name: '', value: '', type: 'string' }, ], ],
    },
    plugins: [
      {
        type: 'lab.plugins.Metadata',
      },
    ],
    metadata: {
      title: '',
      description: '',
      repository: '',
      contributors: '',
    }
  },
}

const defaultTabs = [
  'Content',
  'Behavior',
  'Scripts',
  'Notes',
  'Parameters',
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
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
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
      shuffle: true,
    }
  },
  'lab.flow.Sequence': {
    name: 'Sequence',
    description: 'Show components sequentially',
    category: 'Flow',
    icon: 'sort-amount-down',
    minChildren: 1,
    maxChildren: Infinity,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.flow.Sequence',
      children: [],
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
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
    iconWeight: 'r',
    iconFallbackWeight: 'r',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.html.Form',
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    },
  },
  'lab.html.Frame': {
    name: 'Frame',
    description: 'Create a common frame around nested content',
    category: 'HTML',
    icon: 'expand-wide',
    minChildren: 1,
    maxChildren: 1,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.html.Frame',
      context: '<main data-labjs-section="frame">\n  <!-- Content gets inserted here -->\n</main>',
      contextSelector: '[data-labjs-section="frame"]',
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
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
    iconWeight: 'r',
    iconFallbackWeight: 'r',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.html.Screen',
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
      responses: {
        rows: [ ['', '', '', ''] ],
      },
      messageHandlers: {
        rows: [ [ { title: '', message: '', code: '' }, ], ],
      },
    },
  },
  'lab.canvas.Frame': {
    name: 'Frame',
    description: 'Provide a common canvas for nested components',
    category: 'Canvas',
    icon: 'expand-wide',
    minChildren: 1,
    maxChildren: 1,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.canvas.Frame',
      context: '<!-- Nested components use this canvas -->\n<canvas />',
      contextSelector: 'canvas',
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
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
    icon: 'image',
    iconWeight: 'r',
    iconFallbackWeight: 'r',
    minChildren: 0,
    maxChildren: 0,
    tabs: defaultTabs,
    defaultTab: 'Content',
    defaults: {
      type: 'lab.canvas.Screen',
      content: [],
      parameters: {
        rows: [ [ { name: '', value: '', type: 'string' }, ], ],
      },
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
