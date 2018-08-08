import { createEventLogStore } from './eventlogstore'
import { createProblemStore } from './problemstore'

function createEnlearn (app) {
  if (!app.options.enlearn) {
    return Promise.reject(new Error('Application must provide `enlearn` option object'))
  }
  if (!app.options.enlearn.apiKey) {
    return Promise.reject(new Error('Application must provide `enlearn.apiKey` option'))
  }
  if (!app.options.enlearn.client) {
    return Promise.reject(new Error('Application must provide `enlearn.client` option'))
  }
  if (!app.config.enlearnEcosystem) {
    return Promise.reject(new Error('Application must provide `enlearnEcosystem` config value'))
  }
  if (!app.config.enlearnPolicy) {
    return Promise.reject(new Error('Application must provide `enlearnPolicy` config value'))
  }

  const enlearn = app.options.enlearn.client

  const logStorePromise = createEventLogStore(app)
  const problemStorePromise = createProblemStore(app)

  return Promise.all([logStorePromise, problemStorePromise])
    .then(values => {
      const [logStore, problemStore] = values

      const eventLog = new enlearn.EventLog({
        store: logStore,
      })

      const ecosystem = new enlearn.Ecosystem({
        localData: app.config.enlearnEcosystem,
        eventLog: eventLog,
        problemStore: problemStore,
      })

      const policy = new enlearn.Policy({
        localData: app.config.enlearnPolicy,
      })

      const client = new enlearn.AdaptiveClient({
        ecosystem: ecosystem,
        policy: policy,
        eventLog: eventLog,
        onBrainpoint: app.trigger.bind(app, 'brainpoint'),
      })

      return client.startSession().then(() => client)
    })
}

export function setupPlugin (app) {
  return createEnlearn(app)
    .then(enlearn => { app.enlearn = enlearn })
}

export function teardownPlugin (app) {
  return app.enlearn.endSession()
    .then(() => {
      delete app.enlearn
    })
}
