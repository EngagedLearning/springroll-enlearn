import { setup } from "./setup";
import { validateApp } from "./validate-app";
import { createEnlearnApi } from "./create-enlearn-api";

jest.mock("./validate-app");
jest.mock("./create-enlearn-api");

const mockApi = {
  startSession: jest.fn().mockReturnValue(Promise.resolve()),
};

beforeEach(() => {
  validateApp.mockImplementation(app => Promise.resolve(app));
  createEnlearnApi.mockReturnValue(Promise.resolve(mockApi));
});

test("adds the enlearn API result onto the app", async () => {
  const app = {};
  await setup(app);
  expect(app.enlearn).toBe(mockApi);
});

test("calls startSession on the API", async () => {
  const app = {};
  await setup(app);
  expect(mockApi.startSession).toHaveBeenCalled();
});

test("validates app before creating the API and rejects if it fails", async () => {
  const error = new Error("It's bad!");
  validateApp.mockReturnValue(Promise.reject(error));

  const app = {};
  await expect(setup(app)).rejects.toEqual(error);

  expect(createEnlearnApi).not.toHaveBeenCalled();
});

test("rejects if failure to create API", async () => {
  const error = new Error("Uh oh!");
  createEnlearnApi.mockReturnValue(Promise.reject(error));

  const app = {};
  await expect(setup(app)).rejects.toEqual(error);
});

test("rejects if startSession rejects", async () => {
  const error = new Error("Uh oh!");
  mockApi.startSession.mockReturnValue(Promise.reject(error));

  const app = {};
  await expect(setup(app)).rejects.toEqual(error);
});
