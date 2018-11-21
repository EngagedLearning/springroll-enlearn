import { createUserDataEventLogStore } from "./user-data-event-log-store";
import { createClientAnalyticsEventLogStore } from "./client-analytics-event-log-store";

export const createEventLogStore = app => {
  if (app.clientAnalytics) {
    return createClientAnalyticsEventLogStore(app.clientAnalytics);
  }
  return createUserDataEventLogStore(app.userData);
};
