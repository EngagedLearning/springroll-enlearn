import { setupPlugin, teardownPlugin, handleLearningEvent } from './plugin'

import { createEventLogStore } from './eventlogstore'

jest.mock('./eventlogstore')

describe('setupPlugin', () => {
  test('creates app.enlearn', async () => {
    const eventLogStore = 'event log store'
    createEventLogStore.mockImplementation(() => Promise.resolve(eventLogStore))

    let eventLog
    let ecosystem
    let policy
    let adaptiveClient

    const studentId = '0451'

    const app = {
      config: {
        enlearnEcosystem: 'ecosystem data',
        enlearnPolicy: 'policy data',
      },
      options: {
        enlearn: {
          apiKey: 'some api key',
          client: {
            // mock constructors for objects in the Enlearn Client
            EventLog () {
              this.arguments = [...arguments]
              eventLog = this
              return this
            },
            Ecosystem () {
              this.arguments = [...arguments]
              ecosystem = this
              return this
            },
            Policy () {
              this.arguments = [...arguments]
              policy = this
              return this
            },
            AdaptiveClient () {
              this.arguments = [...arguments]
              this.startSession = jest.fn().mockImplementation(() => Promise.resolve())
              adaptiveClient = this
              return this
            },
          },
        },
      },
      userData: {
        read (key, cb) {
          if (key === 'studentId') {
            cb({ studentId })
          } else {
            cb(null)
          }
        },
        write (key, data, cb) { cb() },
      },
      trigger: jest.fn(),
      on: jest.fn(),
    }

    await setupPlugin(app)

    expect(app.enlearn).toEqual(adaptiveClient)

    expect(eventLog.arguments).toEqual([studentId, eventLogStore])
    expect(ecosystem.arguments).toEqual([app.config.enlearnEcosystem])
    expect(policy.arguments).toEqual([app.config.enlearnPolicy])
    expect(adaptiveClient.arguments).toEqual([{
      ecosystem: ecosystem,
      policy: policy,
      eventLog: eventLog,
      onBrainpoint: expect.any(Function),
    }])

    expect(adaptiveClient.startSession).toHaveBeenCalled()
    expect(app.on).toHaveBeenCalledWith('learningEvent', expect.any(Function))
  })

  function createAppForSetupFailures () {
    return {
      config: {
        enlearnEcosystem: 'ecosystem data',
        enlearnPolicy: 'policy data',
      },
      options: {
        enlearn: {
          apiKey: '12345',
          client: {},
        },
      },
    }
  }

  test('rejects with error if app.options.enlearn is not set', () => {
    const app = createAppForSetupFailures()
    delete app.options.enlearn
    return expect(setupPlugin(app)).rejects.toThrow('Application must provide `enlearn` option object')
  })

  test('rejects with error if app.options.enlearn.apiKey is not set', () => {
    const app = createAppForSetupFailures()
    delete app.options.enlearn.apiKey
    return expect(setupPlugin(app)).rejects.toThrow('Application must provide `enlearn.apiKey` option')
  })

  test('rejects with error if app.options.enlearn.client is not set', () => {
    const app = createAppForSetupFailures()
    delete app.options.enlearn.client
    return expect(setupPlugin(app)).rejects.toThrow('Application must provide `enlearn.client` option')
  })

  test('rejects with error if app.config.enlearnEcosystem is not set', () => {
    const app = createAppForSetupFailures()
    delete app.config.enlearnEcosystem
    return expect(setupPlugin(app)).rejects.toThrow('Application must provide `enlearnEcosystem` config value')
  })

  test('rejects with error if app.config.enlearnPolicy is not set', () => {
    const app = createAppForSetupFailures()
    delete app.config.enlearnPolicy
    return expect(setupPlugin(app)).rejects.toThrow('Application must provide `enlearnPolicy` config value')
  })
})

describe('teardownPlugin', () => {
  test('deletes app.enlearn', async () => {
    const enlearn = {
      endSession: jest.fn().mockImplementation(() => Promise.resolve()),
    }
    const app = {
      enlearn: enlearn,
    }
    await teardownPlugin(app)
    expect(enlearn.endSession).toHaveBeenCalled()
    expect(app.enlearn).not.toBeDefined()
  })
})

describe('handleLearningEvent', () => {
  test('forwards event 7000 to recordProblemStart', () => {
    const client = {
      recordProblemStart: jest.fn(),
    }
    const event = {
      event_id: 7000,
      event_data: {
        problemId: '12345',
        metadata: 'cats',
      },
    }
    handleLearningEvent(event, client)
    expect(client.recordProblemStart).toHaveBeenCalledWith('12345', 'cats')
  })

  test('forwards event 7001 to recordProblemEnd', () => {
    const client = {
      recordProblemEnd: jest.fn(),
    }
    const event = {
      event_id: 7001,
      event_data: {
        problemId: '12345',
        completed: false,
        metadata: 'cats',
      },
    }
    handleLearningEvent(event, client)
    expect(client.recordProblemEnd).toHaveBeenCalledWith('12345', false, 'cats')
  })

  test('forwards event 7002 to recordStepEvidence', () => {
    const client = {
      recordStepEvidence: jest.fn(),
    }
    const event = {
      event_id: 7002,
      event_data: {
        stepId: '12345',
        success: false,
        metadata: 'cats',
      },
    }
    handleLearningEvent(event, client)
    expect(client.recordStepEvidence).toHaveBeenCalledWith('12345', false, 'cats')
  })

  test('forwards event 7003 to recordScaffoldShown', () => {
    const client = {
      recordScaffoldShown: jest.fn(),
    }
    const event = {
      event_id: 7003,
      event_data: {
        stepId: '12345',
        scaffoldId: '0451',
        metadata: 'cats',
      },
    }
    handleLearningEvent(event, client)
    expect(client.recordScaffoldShown).toHaveBeenCalledWith('12345', '0451', 'cats')
  })
})
