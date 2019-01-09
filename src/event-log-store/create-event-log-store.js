import { createUserDataEventLogStore } from "./user-data-event-log-store";
import { createClientAnalyticsEventLogStore } from "./client-analytics-event-log-store";

export const createEventLogStore = app =>
  app.clientAnalytics
    ? createClientAnalyticsEventLogStore(app.clientAnalytics)
    : createUserDataEventLogStore(app.userData);
