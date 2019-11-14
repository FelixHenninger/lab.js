const mousetrap = {
  title: 'Mousetrap',
  description: 'Mouse-tracking data collection',
  version: '0.1.0',
  path: 'global.MousetrapPlugin',
  files: {
  },
  headers: [
    ['comment', { content: 'MousetrapPlugin' }],
    // eslint-disable-next-line no-template-curly-in-string
    ['script', { src: 'https://mousetrap.felixhenninger.com/0.1.0/mousetrap.js' }],
  ],
  options: {
    'mode': {
      label: 'Data format',
      type: 'select',
      options: [
        { label: 'Mousetrap default', coding: 'mousetrap' },
        { label: 'Event stream', coding: 'events' },
      ],
      default: 'mousetrap',
      help: 'Standard moustrap output or raw event stream',
    }
  }
}

export const plugins = {
  mousetrap,
}

export const loadPlugin = name => plugins[name]
