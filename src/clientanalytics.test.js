import { ClientAnalyticsEventLogStore } from "./clientanalytics";

function setup() {
  const clientAnalytics = {
    createCollection: jest.fn().mockImplementation(() => Promise.resolve()),
    registerQuery: jest.fn().mockImplementation(() => Promise.resolve()),
    query: jest.fn().mockImplementation(() => Promise.resolve()),
    insert: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  const testObj = new ClientAnalyticsEventLogStore(clientAnalytics);

  return { testObj, clientAnalytics };
}

test("initialize creates collection and registers queries", async () => {
  const { testObj, clientAnalytics } = setup();
  await testObj.initialize();
  expect(clientAnalytics.createCollection).toHaveBeenCalledWith(
    "enlearnEventLog"
  );
  expect(clientAnalytics.registerQuery).toHaveBeenCalledWith(
    "getAllEvents",
    expect.any(Function)
  );
  expect(clientAnalytics.registerQuery).toHaveBeenCalledWith(
    "getLatestEvent",
    expect.any(Function)
  );
});

test("getAllEvents runs correct query", async () => {
  const { testObj, clientAnalytics } = setup();
  await testObj.getAllEvents();
  expect(clientAnalytics.query).toHaveBeenCalledWith(
    "getAllEvents",
    {},
    "enlearnEventLog"
  );
});

test("getLatestEvent runs correct query", async () => {
  const { testObj, clientAnalytics } = setup();
  await testObj.getLatestEvent();
  expect(clientAnalytics.query).toHaveBeenCalledWith(
    "getLatestEvent",
    {},
    "enlearnEventLog"
  );
});

test("recordEvent runs insert", async () => {
  const { testObj, clientAnalytics } = setup();
  await testObj.recordEvent({ a: 1 });
  expect(clientAnalytics.insert).toHaveBeenCalledWith("enlearnEventLog", {
    a: 1,
  });
});
