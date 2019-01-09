import { getStudentId } from "./get-student-id";
import { createEventLogStore } from "./event-log-store";
import { createPolicyStore } from "./policy-store";

export const createEnlearnApi = app =>
  Promise.all([
    createEventLogStore(app),
    getStudentId(app),
    createPolicyStore(app),
  ]).then(values => {
    const [logStore, studentId, policyStore] = values;
    const { apiKey, appId, apiOverride, client, appData } = app.options.enlearn;
    return client.createEnlearnApi({
      apiKey,
      appId,
      apiOverride,
      appData,
      ecosystem: app.config.enlearnEcosystem,
      policy: app.config.enlearnPolicy,
      logStore,
      policyStore,
      studentId,
    });
  });
