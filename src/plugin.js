import { createEventLogStore } from './eventlogstore'

function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function getStudentId (app) {
  return new Promise(resolve => {
    app.userData.read('studentId', data => {
      if (data && data.studentId) {
        resolve(data.studentId)
      } else {
        data = { studentId: uuid() }
        app.userData.write('studentId', data, () => resolve(data.studentId))
      }
    })
  })
}

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

  return Promise.all([createEventLogStore(app), getStudentId(app)])
    .then(values => {
      const [logStore, studentId] = values
      const enlearn = app.options.enlearn.client
      const eventLog = new enlearn.EventLog(studentId, logStore)
      const ecosystem = new enlearn.Ecosystem(app.config.enlearnEcosystem)
      const policy = new enlearn.Policy(app.config.enlearnPolicy)
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
  if (app.enlearn) {
    return app.enlearn.endSession().then(() => { delete app.enlearn })
  }
}
