import uuid from "uuid/v4";
import { createEventLogStore } from "./event-log-store";
import { createPolicyStore } from "./policy-store";

const getStudentId = app => {
  return new Promise(resolve => {
    app.userData.read("studentId", data => {
      if (data && data.studentId) {
        resolve(data.studentId);
      } else {
        data = { studentId: uuid() };
        app.userData.write("studentId", data, () => resolve(data.studentId));
      }
    });
  });
};

export const handleLearningEvent = (event, client) => {
  switch (event.event_id) {
    case 7000: {
      const { problemId, appData } = event.event_data;
      return client.recordProblemStart(problemId, appData);
    }
    case 7001: {
      const { problemId, completed, appData } = event.event_data;
      return client.recordProblemEnd(problemId, completed, appData);
    }
    case 7002: {
      const { stepId, evidence, appData } = event.event_data;
      return client.recordStepEvidence(stepId, evidence, appData);
    }
    case 7003: {
      const { stepId, scaffoldId, appData } = event.event_data;
      return client.recordScaffoldShown(stepId, scaffoldId, appData);
    }
    default:
      return Promise.resolve();
  }
};

const createEnlearn = app => {
  if (!app.options.enlearn) {
    return Promise.reject(
      new Error("Application must provide `enlearn` option object")
    );
  }
  if (!app.options.enlearn.apiKey) {
    return Promise.reject(
      new Error("Application must provide `enlearn.apiKey` option")
    );
  }
  if (!app.options.enlearn.appId) {
    return Promise.reject(
      new Error("Application must provide `enlearn.appId` option")
    );
  }
  if (!app.options.enlearn.client) {
    return Promise.reject(
      new Error("Application must provide `enlearn.client` option")
    );
  }
  if (!app.config.enlearnEcosystem) {
    return Promise.reject(
      new Error("Application must provide `enlearnEcosystem` config value")
    );
  }
  if (!app.config.enlearnPolicy) {
    return Promise.reject(
      new Error("Application must provide `enlearnPolicy` config value")
    );
  }

  return Promise.all([
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
};

export const setupPlugin = app => {
  return createEnlearn(app).then(api => {
    app.enlearn = api;
    app.on("learningEvent", event => handleLearningEvent(event, api));
    return api.startSession();
  });
};

export const teardownPlugin = app => {
  if (app.enlearn) {
    const enlearn = app.enlearn;
    delete app.enlearn;
    return enlearn.endSession();
  }
  return Promise.resolve();
};
