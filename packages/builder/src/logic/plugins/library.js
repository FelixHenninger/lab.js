const fullscreen = {
  title: 'Fullscreen',
  description: 'Enable fullscreen mode for portions of the study',
  version: '0.1.0',
  path: 'lab.plugins.Fullscreen',
  files: {},
  headers: [],
  options: {
    'message': {
      label: 'Message',
      type: 'text',
      placeholder: 'This experiment requires full screen display',
    },
    'hint': {
      label: 'Help text',
      type: 'text',
      placeholder: 'Please click to continue in full screen mode',
    }
  }
}

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
  fullscreen,
  mousetrap,
}

export const loadPlugin = name => plugins[name]
