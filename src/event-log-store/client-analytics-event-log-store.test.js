import { createClientAnalyticsEventLogStore } from "./client-analytics-event-log-store";

const setup = async () => {
  const clientAnalytics = {
    createCollection: jest.fn().mockImplementation(() => Promise.resolve()),
    registerQuery: jest.fn().mockImplementation(() => Promise.resolve()),
    query: jest.fn().mockImplementation(() => Promise.resolve()),
    insert: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  const testObj = await createClientAnalyticsEventLogStore(clientAnalytics);
  return { testObj, clientAnalytics };
};

test("initialize creates collection and registers queries", async () => {
  const { clientAnalytics } = await setup();
  expect(clientAnalytics.createCollection).toHaveBeenCalledWith(
    "enlearnEventLog"
  );
  expect(clientAnalytics.registerQuery).toHaveBeenCalledWith(
    "getAllEvents",
    expect.any(Function)
  );
  expect(clientAnalytics.registerQuery).toHaveBeenCalledWith(
    "getEventsToUpload",
    expect.any(Function)
  );
  expect(clientAnalytics.registerQuery).toHaveBeenCalledWith(
    "markEventsAsUploaded",
    expect.any(Function)
  );
});

test("getAllEvents runs correct query", async () => {
  const { testObj, clientAnalytics } = await setup();
  await testObj.getAllEvents();
  expect(clientAnalytics.query).toHaveBeenCalledWith(
    "getAllEvents",
    {},
    "enlearnEventLog"
  );
});

test("getEventsToUpload runs correct query", async () => {
  const { testObj, clientAnalytics } = await setup();
  await testObj.getEventsToUpload();
  expect(clientAnalytics.query).toHaveBeenCalledWith(
    "getEventsToUpload",
    {},
    "enlearnEventLog"
  );
});

test("markEventsAsUploaded runs correct query", async () => {
  const { testObj, clientAnalytics } = await setup();
  await testObj.markEventsAsUploaded();
  expect(clientAnalytics.query).toHaveBeenCalledWith(
    "markEventsAsUploaded",
    {},
    "enlearnEventLog"
  );
});

test("recordEvent inserts event and initial uploaded flag set to false", async () => {
  const { testObj, clientAnalytics } = await setup();
  await testObj.recordEvent({ a: 1 });
  expect(clientAnalytics.insert).toHaveBeenCalledWith("enlearnEventLog", {
    event: { a: 1 },
    uploaded: false,
  });
});
