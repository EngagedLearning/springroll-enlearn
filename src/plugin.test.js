import { setupPlugin, teardownPlugin } from "./plugin";
import { createEventLogStore } from "./event-log-store";
import { createPolicyStore } from "./policy-store";

jest.mock("./event-log-store");
jest.mock("./policy-store");

const mockEventLogStore = { eventLogStore: true };
const mockPolicyStore = { policyStore: true };

beforeAll(() => {
  createEventLogStore.mockReturnValue(Promise.resolve(mockEventLogStore));
  createPolicyStore.mockReturnValue(Promise.resolve(mockPolicyStore));
});

describe("setupPlugin", () => {
  test("creates app.enlearn", async () => {
    const studentId = "0451";
    const api = {
      startSession: jest.fn().mockImplementation(() => Promise.resolve()),
    };
    const appData = {
      releaseBuild: true,
      someOtherValue: 99,
    };

    const app = {
      config: {
        enlearnEcosystem: "ecosystem data",
        enlearnPolicy: "policy data",
      },
      options: {
        enlearn: {
          apiKey: "some api key",
          appId: "my cool app",
          apiOverride: "some other API server",
          appData,
          client: {
            createEnlearnApi: jest
              .fn()
              .mockImplementation(() => Promise.resolve(api)),
          },
        },
      },
      userData: {
        read(key, cb) {
          if (key === "studentId") {
            cb({ studentId });
          } else {
            cb(null);
          }
        },
        write(key, data, cb) {
          cb();
        },
      },
      on: jest.fn(),
    };

    await setupPlugin(app);

    expect(app.enlearn).toEqual(api);

    expect(app.options.enlearn.client.createEnlearnApi).toHaveBeenCalledWith({
      apiKey: "some api key",
      appId: "my cool app",
      apiOverride: "some other API server",
      appData,
      ecosystem: app.config.enlearnEcosystem,
      policy: app.config.enlearnPolicy,
      logStore: mockEventLogStore,
      policyStore: mockPolicyStore,
      studentId,
    });

    expect(api.startSession).toHaveBeenCalled();
  });

  const createAppForSetupFailures = () => ({
    config: {
      enlearnEcosystem: "ecosystem data",
      enlearnPolicy: "policy data",
    },
    options: {
      enlearn: {
        apiKey: "12345",
        appId: "app",
        client: {},
      },
    },
  });

  test("rejects with error if app.options.enlearn is not set", () => {
    const app = createAppForSetupFailures();
    delete app.options.enlearn;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearn` option object"
    );
  });

  test("rejects with error if app.options.enlearn.apiKey is not set", () => {
    const app = createAppForSetupFailures();
    delete app.options.enlearn.apiKey;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearn.apiKey` option"
    );
  });

  test("rejects with error if app.options.enlearn.appId is not set", () => {
    const app = createAppForSetupFailures();
    delete app.options.enlearn.appId;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearn.appId` option"
    );
  });

  test("rejects with error if app.options.enlearn.client is not set", () => {
    const app = createAppForSetupFailures();
    delete app.options.enlearn.client;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearn.client` option"
    );
  });

  test("rejects with error if app.config.enlearnEcosystem is not set", () => {
    const app = createAppForSetupFailures();
    delete app.config.enlearnEcosystem;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearnEcosystem` config value"
    );
  });

  test("rejects with error if app.config.enlearnPolicy is not set", () => {
    const app = createAppForSetupFailures();
    delete app.config.enlearnPolicy;
    return expect(setupPlugin(app)).rejects.toThrow(
      "Application must provide `enlearnPolicy` config value"
    );
  });
});

describe("teardownPlugin", () => {
  test("deletes app.enlearn", async () => {
    const enlearn = {
      endSession: jest.fn().mockImplementation(() => Promise.resolve()),
    };
    const app = {
      enlearn,
    };
    await teardownPlugin(app);
    expect(enlearn.endSession).toHaveBeenCalled();
    expect(app.enlearn).not.toBeDefined();
  });

  test("returns promise if app is not set", () => {
    const app = {};
    expect(teardownPlugin(app)).toBeInstanceOf(Promise);
  });
});
