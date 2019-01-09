import { createEnlearnApi } from "./create-enlearn-api";
import { getStudentId } from "./get-student-id";
import { createEventLogStore } from "./event-log-store";
import { createPolicyStore } from "./policy-store";

jest.mock("./get-student-id");
jest.mock("./event-log-store");
jest.mock("./policy-store");

beforeEach(() => {
  getStudentId.mockReturnValue(Promise.resolve("abc123"));
  createEventLogStore.mockReturnValue(Promise.resolve("event-log-store"));
  createPolicyStore.mockReturnValue(Promise.resolve("policy-store"));
});

test("creates app.enlearn", async () => {
  const config = {
    enlearnEcosystem: "ecosystem data",
    enlearnPolicy: "policy data",
  };
  const client = {
    createEnlearnApi: jest.fn().mockReturnValue("enlearn-api"),
  };
  const options = {
    enlearn: {
      apiKey: "some api key",
      appId: "my cool app",
      apiOverride: "some other API server",
      appData: {
        cats: "dogs",
      },
      client,
    },
  };
  const app = {
    config,
    options,
  };

  await expect(createEnlearnApi(app)).resolves.toEqual("enlearn-api");

  expect(client.createEnlearnApi.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Object {
      "apiKey": "some api key",
      "apiOverride": "some other API server",
      "appData": Object {
        "cats": "dogs",
      },
      "appId": "my cool app",
      "ecosystem": "ecosystem data",
      "logStore": "event-log-store",
      "policy": "policy data",
      "policyStore": "policy-store",
      "studentId": "abc123",
    },
  ],
]
`);
});
