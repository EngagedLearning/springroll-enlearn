import { createEventLogStore, UserDataEventLogStore } from './eventlogstore'

describe('createEventLogStore', () => {
  test('returns promise that resolves to UserDataEventLogStore', () => {
    const app = { userData: { read (key, cb) { cb(null) } } }
    return expect(createEventLogStore(app)).resolves.toBeInstanceOf(UserDataEventLogStore)
  })
})

describe('UserDataEventLogStore', () => {
  function setup () {
    const userData = {
      read: jest.fn().mockImplementation((key, cb) => { cb() }),
      write: jest.fn().mockImplementation((key, value, cb) => { cb() }),
    }

    const testObj = new UserDataEventLogStore(userData)

    return { testObj, userData }
  }

  test('records starts empty', () => {
    const { testObj } = setup()
    return expect(testObj.getEventLogRecords()).resolves.toEqual([])
  })

  test('initialize reads from user data', () => {
    const { testObj, userData } = setup()

    userData.read.mockReset()

    const promise = testObj.initialize()

    expect(userData.read).toHaveBeenCalledWith('enlearnEventLog', expect.any(Function))

    const callback = userData.read.mock.calls[0][1]
    callback([1, 2, 3])

    return promise.then(() => {
      return expect(testObj.getEventLogRecords()).resolves.toEqual([1, 2, 3])
    })
  })

  test('addEventLogRecord adds a record', () => {
    const { testObj } = setup()

    return testObj.addEventLogRecord(1)
      .then(() => expect(testObj.getEventLogRecords()).resolves.toEqual([1]))
  })

  test('addEventLogRecord writes records to store', async () => {
    const { testObj, userData } = setup()

    await testObj.addEventLogRecord(1)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1], expect.any(Function))

    await testObj.addEventLogRecord(2)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1, 2], expect.any(Function))

    await testObj.addEventLogRecord(3)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1, 2, 3], expect.any(Function))
  })
})
