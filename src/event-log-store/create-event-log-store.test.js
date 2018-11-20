import { createEventLogStore } from "./create-event-log-store";
import { createUserDataEventLogStore } from "./user-data-event-log-store";
import { createClientAnalyticsEventLogStore } from "./client-analytics-event-log-store";

jest.mock("./user-data-event-log-store");
jest.mock("./client-analytics-event-log-store");

const mockUserDataEventStore = {};
const mockClientAnalyticsEventStore = {};

beforeAll(() => {
  createUserDataEventLogStore.mockImplementation(() =>
    Promise.resolve(mockUserDataEventStore)
  );
  createClientAnalyticsEventLogStore.mockImplementation(() =>
    Promise.resolve(mockClientAnalyticsEventStore)
  );
});

test("returns promise that resolves to client analytics store if app has clientAnalytics", () => {
  const app = {
    clientAnalytics: {
      createCollection: () => Promise.resolve(),
      registerQuery: () => Promise.resolve(),
    },
  };

  return expect(createEventLogStore(app)).resolves.toBe(
    mockClientAnalyticsEventStore
  );
});

test("returns promise that resolves to user data store if app does not have clientAnalytics", () => {
  const app = {
    userData: {
      read: (key, cb) => {
        cb(null);
      },
    },
  };

  return expect(createEventLogStore(app)).resolves.toBe(mockUserDataEventStore);
});
