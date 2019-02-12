import { getStudentId } from "./get-student-id";
import { createDataStore } from "./data-store";

export const createEnlearnApi = app => {
  const { apiKey, appId, apiOverride, client, appData } = app.options.enlearn;
  const dataStore = createDataStore(appId);

  return getStudentId(dataStore).then(studentId =>
    client.createEnlearnApi({
      apiKey,
      appId,
      apiOverride,
      appData,
      ecosystem: app.config.enlearnEcosystem,
      policy: app.config.enlearnPolicy,
      studentId,
      dataStore,
    })
  );
};
