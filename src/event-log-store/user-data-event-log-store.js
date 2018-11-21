const EVENTS_KEY = "enlearnEventLog";
const NOT_UPLOADED_KEY = "enlearnEventLogNotUploaded";

export const createUserDataEventLogStore = userData => {
  let events = [];
  let notUploadedIds = [];

  const getAllEvents = () => Promise.resolve(events.slice());

  const recordEvent = event => {
    events.push(event);
    notUploadedIds.push(event.id);
    return new Promise(resolve =>
      userData.write(EVENTS_KEY, events, () => {
        userData.write(NOT_UPLOADED_KEY, notUploadedIds, resolve);
      })
    );
  };

  const getEventsToUpload = () =>
    Promise.resolve(events.filter(e => notUploadedIds.indexOf(e.id) >= 0));

  const markEventsAsUploaded = eventIds => {
    notUploadedIds = notUploadedIds.filter(id => eventIds.indexOf(id) < 0);
    return new Promise(resolve =>
      userData.write(NOT_UPLOADED_KEY, notUploadedIds, resolve)
    );
  };

  return Promise.all([
    new Promise(resolve => {
      userData.read(EVENTS_KEY, data => {
        events = data || [];
        resolve();
      });
    }),
    new Promise(resolve => {
      userData.read(NOT_UPLOADED_KEY, data => {
        notUploadedIds = data || [];
        resolve();
      });
    }),
  ]).then(() => ({
    getAllEvents,
    recordEvent,
    getEventsToUpload,
    markEventsAsUploaded,
  }));
};
