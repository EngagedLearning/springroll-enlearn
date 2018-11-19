const EVENTS_COLLECTION = "enlearnEventLog";
const QUERY_ALL = "getAllEvents";
const QUERY_NOT_UPLOADED = "getEventsToUpload";
const QUERY_MARK_UPLOADED = "markEventsAsUploaded";

export const createClientAnalyticsEventLogStore = clientAnalytics => {
  const getAllEvents = () =>
    clientAnalytics.query(QUERY_ALL, {}, EVENTS_COLLECTION);
  const recordEvent = event =>
    clientAnalytics.insert(EVENTS_COLLECTION, { event, uploaded: false });
  const getEventsToUpload = () =>
    clientAnalytics.query(QUERY_NOT_UPLOADED, {}, EVENTS_COLLECTION);
  const markEventsAsUploaded = ids =>
    clientAnalytics.query(QUERY_MARK_UPLOADED, { ids }, EVENTS_COLLECTION);

  const store = {
    getAllEvents,
    recordEvent,
    getEventsToUpload,
    markEventsAsUploaded,
  };

  return clientAnalytics
    .createCollection(EVENTS_COLLECTION)
    .then(() =>
      clientAnalytics.registerQuery(QUERY_ALL, collection => {
        return collection
          .chain()
          .simplesort("event.sequenceNumber", false)
          .data()
          .map(r => r.event);
      })
    )
    .then(() =>
      clientAnalytics.registerQuery(QUERY_NOT_UPLOADED, collection => {
        return collection
          .chain()
          .find({ uploaded: { $ne: true } })
          .limit(50)
          .data()
          .map(r => r.event);
      })
    )
    .then(() =>
      clientAnalytics.registerQuery(
        QUERY_MARK_UPLOADED,
        (collection, params) => {
          const records = collection
            .chain()
            .find({ uploaded: { $ne: true } })
            .where(r => params.ids.indexOf(r.event.id) >= 0)
            .data();

          for (let i = 0; i < records.length; i++) {
            const r = records[i];
            r.uploaded = true;
            collection.update(r);
          }

          return null;
        }
      )
    )
    .then(() => store);
};
