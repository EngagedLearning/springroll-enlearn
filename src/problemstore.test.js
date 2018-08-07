import { createProblemStore, UserDataProblemStore } from './problemstore'

describe('createProblemStore', () => {
  test('returns promise that resolves to UserDataProblemStore', () => {
    const app = { userData: { read (key, cb) { cb(null) } } }
    return expect(createProblemStore(app)).resolves.toBeInstanceOf(UserDataProblemStore)
  })
})

describe('UserDataProblemStore', () => {
  function setup () {
    const userData = {
      read: jest.fn().mockImplementation((key, cb) => { cb() }),
      write: jest.fn().mockImplementation((key, value, cb) => { cb() }),
    }

    const testObj = new UserDataProblemStore(userData)

    return { testObj, userData }
  }

  test('initialize reads from user data', () => {
    const { testObj, userData } = setup()

    userData.read.mockReset()

    const promise = testObj.initialize()

    expect(userData.read).toHaveBeenCalledWith('enlearnProblemStore', expect.any(Function))

    const callback = userData.read.mock.calls[0][1]
    callback({ a: 'b' })

    return promise.then(() => {
      return expect(testObj.getProblem('a')).resolves.toEqual('b')
    })
  })

  test('saveProblem stores the problem', () => {
    const { testObj } = setup()

    const problem = {
      id: 'cats',
      steps: ['dogs'],
    }

    return testObj.saveProblem(problem)
      .then(() => expect(testObj.getProblem('cats')).resolves.toEqual(problem))
  })

  test('saveProblem writes problems to store', async () => {
    const { testObj, userData } = setup()

    const p1 = { id: '1', data: 'dogs1' }
    const p2 = { id: '2', data: 'dogs2' }
    const p3 = { id: '3', data: 'dogs3' }

    await testObj.saveProblem(p1)
    expect(userData.write).toHaveBeenCalledWith('enlearnProblemStore', { 1: p1 }, expect.any(Function))

    await testObj.saveProblem(p2)
    expect(userData.write).toHaveBeenCalledWith('enlearnProblemStore', { 1: p1, 2: p2 }, expect.any(Function))

    await testObj.saveProblem(p3)
    expect(userData.write).toHaveBeenCalledWith('enlearnProblemStore', { 1: p1, 2: p2, 3: p3 }, expect.any(Function))
  })
})
