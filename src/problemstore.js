export function createProblemStore (app) {
  const store = new UserDataProblemStore(app.userData)
  return store.initialize().then(() => store)
}

export class UserDataProblemStore {
  constructor (userData) {
    this._userData = userData
    this._problems = {}
  }

  initialize () {
    return new Promise(resolve => {
      this._userData.read(UserDataProblemStore.storeKey, data => {
        this._problems = data || {}
        resolve()
      })
    })
  }

  getProblem (problemId) {
    return Promise.resolve(this._problems[problemId] || null)
  }

  saveProblem (problem) {
    this._problems[problem.id] = problem
    return new Promise(resolve => this._userData.write(UserDataProblemStore.storeKey, this._problems, resolve))
  }
}
UserDataProblemStore.storeKey = 'enlearnProblemStore'
