const CA_COLLECTION = "enlearnEventLog";
const CA_QUERY_ALL = "getAllEvents";
const CA_QUERY_LATEST = "getLatestEvent";

export class ClientAnalyticsEventLogStore {
  constructor(clientAnalytics) {
    this._ca = clientAnalytics;
  }

  initialize() {
    return this._ca
      .createCollection(CA_COLLECTION)
      .then(() =>
        this._ca.registerQuery(CA_QUERY_ALL, collection => {
          return collection
            .chain()
            .simplesort("recordTime", false)
            .simplesort("sequenceNumber", false)
            .data()
            .map(r => r.event);
        })
      )
      .then(() =>
        this._ca.registerQuery(CA_QUERY_LATEST, collection => {
          const results = collection
            .chain()
            .simplesort("recordTime", true)
            .simplesort("sequenceNumber", true)
            .limit(1)
            .data()
            .map(r => r.event);
          return results.length > 0 ? results[0] : null;
        })
      );
  }

  getAllEvents() {
    return this._ca.query(CA_QUERY_ALL, {}, CA_COLLECTION);
  }

  getLatestEvent() {
    return this._ca.query(CA_QUERY_LATEST, {}, CA_COLLECTION);
  }

  recordEvent(event) {
    return this._ca.insert(CA_COLLECTION, { event });
  }
}
