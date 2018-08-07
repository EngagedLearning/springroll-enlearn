import { setupPlugin, teardownPlugin } from './plugin'

import { createEventLogStore } from './eventlogstore'
import { createProblemStore } from './problemstore'

jest.mock('./eventlogstore')
jest.mock('./problemstore')

test('setupPlugin creates app.enlearn', async () => {
  const eventLogStore = 'event log store'
  createEventLogStore.mockImplementation(() => Promise.resolve(eventLogStore))

  const problemStore = 'problem store'
  createProblemStore.mockImplementation(() => Promise.resolve(problemStore))

  let eventLog
  let ecosystem
  let policy
  let adaptiveClient

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
      read (key, cb) { cb(null) },
    },
    trigger: jest.fn(),
  }

  await setupPlugin(app)

  expect(app.enlearn).toEqual(adaptiveClient)

  expect(eventLog.arguments).toEqual([{ store: eventLogStore }])
  expect(ecosystem.arguments).toEqual([{
    localData: app.config.enlearnEcosystem,
    problemStore: problemStore,
    eventLog: eventLog,
  }])
  expect(policy.arguments).toEqual([{
    localData: app.config.enlearnPolicy,
  }])
  expect(adaptiveClient.arguments).toEqual([{
    ecosystem: ecosystem,
    policy: policy,
    eventLog: eventLog,
    onBrainpoint: expect.any(Function),
  }])

  expect(adaptiveClient.startSession).toHaveBeenCalled()
})

test('teardownPlugin deletes app.enlearn', async () => {
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
