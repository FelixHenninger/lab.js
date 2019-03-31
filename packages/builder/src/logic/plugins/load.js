const testingPlugin = {
  title: 'Test plugin',
  name: 'testingPlugin',
  version: '0.0.1',
  path: 'global.TestPlugin',
  files: {
    'index.js': {
      content: 'data:text/javascript;base64,Y2xhc3MgVGVzdFBsdWdpbiB7CiAgY29uc3RydWN0b3Iob3B0aW9ucykgewogICAgY29uc29sZS5sb2coJ1Rlc3RQbHVnaW4gaW5pdGlhbGl6ZWQgd2l0aCBvcHRpb25zJywgb3B0aW9ucykKICB9CgogIGhhbmRsZShjb250ZXh0LCBldmVudCkgewogICAgY29uc29sZS5sb2coYEhhbmRsaW5nICR7IGV2ZW50IH0gb25gLCBjb250ZXh0KQogIH0KfQoKd2luZG93LlRlc3RQbHVnaW4gPSBUZXN0UGx1Z2luCg==',
    }
  },
  headers: [
    ['comment', { content: 'TestingPlugin' }],
    // eslint-disable-next-line no-template-curly-in-string
    ['script', { src: '${ pluginPath }/index.js' }],
  ],
}

const plugins = {
  testingPlugin,
}

const loadPlugin = name => plugins[name]

export default loadPlugin
