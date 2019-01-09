import { validateApp } from "./validate-app";

let app;

beforeEach(() => {
  app = {
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
  };
});

const validateError = err => expect(validateApp(app)).rejects.toThrow(err);

test("resolves with app if no errors", () => {
  return expect(validateApp(app)).resolves.toBe(app);
});

test("rejects with error if app.options.enlearn is not set", () => {
  delete app.options.enlearn;
  return validateError("Application must provide `enlearn` option object");
});

test("rejects with error if app.options.enlearn.apiKey is not set", () => {
  delete app.options.enlearn.apiKey;
  return validateError("Application must provide `enlearn.apiKey` option");
});

test("rejects with error if app.options.enlearn.appId is not set", () => {
  delete app.options.enlearn.appId;
  return validateError("Application must provide `enlearn.appId` option");
});

test("rejects with error if app.options.enlearn.client is not set", () => {
  delete app.options.enlearn.client;
  return validateError("Application must provide `enlearn.client` option");
});

test("rejects with error if app.config.enlearnEcosystem is not set", () => {
  delete app.config.enlearnEcosystem;
  return validateError(
    "Application must provide `enlearnEcosystem` config value"
  );
});

test("rejects with error if app.config.enlearnPolicy is not set", () => {
  delete app.config.enlearnPolicy;
  return validateError("Application must provide `enlearnPolicy` config value");
});
