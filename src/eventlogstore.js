export function createEventLogStore (app) {
  const store = new UserDataEventLogStore(app.userData)
  return store.initialize().then(() => store)
}

export class UserDataEventLogStore {
  constructor (userData) {
    this._userData = userData
    this._events = []
  }

  initialize () {
    return new Promise(resolve => {
      this._userData.read(UserDataEventLogStore.storeKey, data => {
        this._events = data || []
        resolve()
      })
    })
  }

  getAllEvents () {
    return Promise.resolve(this._events)
  }

  getEventsWithTypes (types) {
    return Promise.resolve(this._events.filter(r => types.indexOf(r.type) >= 0))
  }

  getLatestEvent () {
    return Promise.resolve(this._events.length > 0 ? this._events[this._events.length - 1] : null)
  }

  recordEvent (event) {
    this._events.push(event)
    return new Promise(resolve => this._userData.write(UserDataEventLogStore.storeKey, this._events, resolve))
  }
}
UserDataEventLogStore.storeKey = 'enlearnEventLog'
