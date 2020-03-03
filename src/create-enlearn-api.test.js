import { createEnlearnApi } from "./create-enlearn-api";
import { getStudentId } from "./get-student-id";
import { createWarehouse } from "@enlearn/warehouse";

jest.mock("./get-student-id");
jest.mock("@enlearn/warehouse");

beforeEach(() => {
  getStudentId.mockReturnValue(Promise.resolve("abc123"));
  createWarehouse.mockReturnValue("warehouse");
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
      "policy": "policy data",
      "studentId": "abc123",
      "warehouse": "warehouse",
      "disableApi": true
    },
  ],
]
`);
});
