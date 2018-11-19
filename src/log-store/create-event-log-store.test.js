import { createEventLogStore } from "./create-event-log-store";
import { createUserDataEventLogStore } from "./userdata";
import { createClientAnalyticsEventLogStore } from "./clientanalytics";

jest.mock("./userdata");
jest.mock("./clientanalytics");

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
