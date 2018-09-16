import uuid from "uuid/v4";
import { UserDataEventLogStore } from "./userdata";
import { ClientAnalyticsEventLogStore } from "./clientanalytics";

function getStudentId(app) {
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
}

export function createEventLogStore(app) {
  let store;
  if (app.clientAnalytics) {
    store = new ClientAnalyticsEventLogStore(app.clientAnalytics);
  } else {
    store = new UserDataEventLogStore(app.userData);
  }
  return store.initialize().then(() => store);
}

export function handleLearningEvent(event, client) {
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
}

function createEnlearn(app) {
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

  return Promise.all([createEventLogStore(app), getStudentId(app)]).then(
    values => {
      const [logStore, studentId] = values;
      const enlearn = app.options.enlearn.client;
      return enlearn.createEnlearnApi({
        apiKey: app.options.enlearn.apiKey,
        ecosystem: app.config.enlearnEcosystem,
        policy: app.config.enlearnPolicy,
        logStore,
        studentId,
      });
    }
  );
}

export function setupPlugin(app) {
  return createEnlearn(app).then(api => {
    app.enlearn = api;
    app.on("learningEvent", event => handleLearningEvent(event, api));
    return api.startSession();
  });
}

export function teardownPlugin(app) {
  if (app.enlearn) {
    const enlearn = app.enlearn;
    delete app.enlearn;
    return enlearn.endSession();
  }
  return Promise.resolve();
}
