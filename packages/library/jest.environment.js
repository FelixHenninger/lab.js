const JSDOMEnvironment = require('jest-environment-jsdom')

class TestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup()

    // Inject minimal AudioContext
    this.global.AudioContext = function() {}

    // Inject minimal Matrix constructor
    this.global.DOMMatrixReadOnly = function() {}

    // Inject document timeline
    this.global.document.timeline = {
      currentTime: 123
    }

    // Inject global build variables
    this.global.BUILD_FLAVOR = 'testing'
    this.global.BUILD_COMMIT = 'abcdefg'
  }
}

module.exports = TestEnvironment
