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

export function handleLearningEvent (event, client) {
  switch (event.event_id) {
    case 7000: {
      return client.recordProblemStart(event.event_data.problemId, event.event_data.metadata)
    }
    case 7001: {
      return client.recordProblemEnd(event.event_data.problemId, event.event_data.completed, event.event_data.metadata)
    }
    case 7002: {
      return client.recordStepEvidence(event.event_data.stepId, event.event_data.success, event.event_data.metadata)
    }
    case 7003: {
      return client.recordScaffoldShown(event.event_data.stepId, event.event_data.scaffoldId, event.event_data.metadata)
    }
  }
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
      const ecosystem = app.config.enlearnEcosystem
      const policy = app.config.enlearnPolicy
      const onBrainpoint = app.trigger.bind(app, 'brainpoint')
      return enlearn.createEnlearnApi({ ecosystem, policy, logStore, onBrainpoint, studentId })
        .then(client => {
          app.on('learningEvent', event => handleLearningEvent(event, client))
          return client
        })
    })
}

export function setupPlugin (app) {
  return createEnlearn(app)
    .then(enlearn => enlearn.startSession().then(() => enlearn))
    .then(enlearn => { app.enlearn = enlearn })
}

export function teardownPlugin (app) {
  if (app.enlearn) {
    return app.enlearn.endSession().then(() => { delete app.enlearn })
  }
}
