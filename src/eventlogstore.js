export function createEventLogStore (app) {
  const store = new UserDataEventLogStore(app.userData)
  return store.initialize().then(() => store)
}

export class UserDataEventLogStore {
  constructor (userData) {
    this._userData = userData
    this._records = []
  }

  initialize () {
    return new Promise(resolve => {
      this._userData.read(UserDataEventLogStore.storeKey, data => {
        this._records = data || []
        resolve()
      })
    })
  }

  addEventLogRecord (record) {
    this._records.push(record)
    return new Promise(resolve => this._userData.write(UserDataEventLogStore.storeKey, this._records, resolve))
  }

  getEventLogRecords () {
    return Promise.resolve(this._records)
  }
}
UserDataEventLogStore.storeKey = 'enlearnEventLog'
