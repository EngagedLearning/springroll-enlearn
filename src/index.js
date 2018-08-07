import { setupPlugin, teardownPlugin } from './plugin'

(function () {
  const ApplicationPlugin = window.include('springroll.ApplicationPlugin')

  const plugin = new ApplicationPlugin()

  plugin.setup = function () {
    const enlearnOptions = {
      apiKey: null,
      client: null,
    }
    this.options.add('enlearn', enlearnOptions)
  }

  plugin.preload = function (done) {
    return setupPlugin(this)
      .then(done)
      .catch(err => {
        console.error(`Error initializing Enlearn plugin: ${err}`)
      })
  }

  plugin.teardown = function () {
    teardownPlugin(this)
      .catch(err => {
        console.error(`Error shutting down Enlearn plugin: ${err}`)
      })
  }
})()
