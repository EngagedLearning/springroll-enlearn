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
    return expect(testObj.getLatestEvent()).resolves.toEqual(null)
  })

  test('initialize reads from user data', () => {
    const { testObj, userData } = setup()

    userData.read.mockReset()

    const promise = testObj.initialize()

    expect(userData.read).toHaveBeenCalledWith('enlearnEventLog', expect.any(Function))

    const callback = userData.read.mock.calls[0][1]

    const events = [
      { type: 'a', value: 1 },
      { type: 'a', value: 2 },
      { type: 'a', value: 3 },
    ]
    callback(events)

    return promise.then(() => {
      return expect(testObj.getAllEvents()).resolves.toEqual(events)
    })
  })

  test('getEventsWithTypes filters records by type', () => {
    const { testObj } = setup()

    const events = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'c', value: 3 },
    ]

    return expect(
      testObj.recordEvent(events[0])
        .then(() => testObj.recordEvent(events[1]))
        .then(() => testObj.recordEvent(events[2]))
        .then(() => testObj.getEventsWithTypes(['a', 'c']))
    ).resolves.toEqual([events[0], events[2]])
  })

  test('recordEvent adds a record', () => {
    const { testObj } = setup()

    const event = { type: 'a', value: 'blah' }
    return testObj.recordEvent(event)
      .then(() => expect(testObj.getLatestEvent()).resolves.toEqual(event))
  })

  test('recordEvent writes records to store', async () => {
    const { testObj, userData } = setup()

    await testObj.recordEvent(1)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1], expect.any(Function))

    await testObj.recordEvent(2)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1, 2], expect.any(Function))

    await testObj.recordEvent(3)
    expect(userData.write).toHaveBeenCalledWith('enlearnEventLog', [1, 2, 3], expect.any(Function))
  })
})
