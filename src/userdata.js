const UD_STORE_KEY = "enlearnEventLog";

export class UserDataEventLogStore {
  constructor(userData) {
    this._userData = userData;
    this._events = [];
  }

  initialize() {
    return new Promise(resolve => {
      this._userData.read(UD_STORE_KEY, data => {
        this._events = data || [];
        resolve();
      });
    });
  }

  getAllEvents() {
    return Promise.resolve(this._events.slice());
  }

  getLatestEvent() {
    return Promise.resolve(
      this._events.length > 0 ? this._events[this._events.length - 1] : null
    );
  }

  recordEvent(event) {
    this._events.push(event);
    return new Promise(resolve =>
      this._userData.write(UD_STORE_KEY, this._events, resolve)
    );
  }
}
