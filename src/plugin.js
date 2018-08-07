import { createEventLogStore } from './eventlogstore'
import { createProblemStore } from './problemstore'

function createEnlearn (app) {
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
