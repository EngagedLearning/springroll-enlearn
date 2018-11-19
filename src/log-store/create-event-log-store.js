import { createUserDataEventLogStore } from "./userdata";
import { createClientAnalyticsEventLogStore } from "./clientanalytics";

export const createEventLogStore = app => {
  if (app.clientAnalytics) {
    return createClientAnalyticsEventLogStore(app.clientAnalytics);
  }
  return createUserDataEventLogStore(app.userData);
};
