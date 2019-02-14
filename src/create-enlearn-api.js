import { getStudentId } from "./get-student-id";
import { createWarehouse } from "@enlearn/warehouse";

export const createEnlearnApi = app => {
  const { apiKey, appId, apiOverride, client, appData } = app.options.enlearn;
  const warehouse = createWarehouse({ scope: `enlearn.${appId}` });

  return getStudentId(warehouse).then(studentId =>
    client.createEnlearnApi({
      apiKey,
      appId,
      apiOverride,
      appData,
      ecosystem: app.config.enlearnEcosystem,
      policy: app.config.enlearnPolicy,
      studentId,
      warehouse,
    })
  );
};
