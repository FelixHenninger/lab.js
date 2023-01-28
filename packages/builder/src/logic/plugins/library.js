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
    },
    'close': {
      label: 'Leave fullscreen mode when component ends',
      type: 'checkbox',
      default: true,
    }
  }
}

const metadata = {
  title: 'Metadata',
  description: 'Default metadata collection plugin',
  path: 'lab.plugins.Metadata',
  files: {},
  headers: [],
  options: {},
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

const style = {
  title: 'Style',
  description: 'Change study appearance',
  path: 'lab.plugins.Style',
  files: {},
  headers: [],
  options: {
    'properties.--color-text': {
      default: 'black',
    },
    'properties.--color-background': {
      default: 'white',
    },
    'properties.--color-gray-background': {
      default: '#f8f8f8',
    },
    'properties.--color-gray-content': {
      default: '#8d8d8d',
    },
    'properties.--color-border': {
      default: '#e5e5e5',
    },
    'properties.--color-border-internal': {
      default: '#efefef',
    },
    'transition': {
      default: true,
    },
  },
}

export const plugins = {
  fullscreen,
  style,
  metadata,
  mousetrap,
}

export const loadPlugin = name => plugins[name]
