const JSDOMEnvironment = require('jest-environment-jsdom')

class TestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup()

    // Inject minimal AudioContext
    this.global.AudioContext = function() {}
  }
}

module.exports = TestEnvironment
