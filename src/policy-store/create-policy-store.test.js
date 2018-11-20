import { createPolicyStore } from "./create-policy-store";
import { createUserDataPolicyStore } from "./userdata";

jest.mock("./userdata");

const mockUserDataPolicyStore = {};

beforeAll(() => {
  createUserDataPolicyStore.mockReturnValue(
    Promise.resolve(mockUserDataPolicyStore)
  );
});

test("returns promise that resolves to user data store", () => {
  const app = { userData: {} };
  return expect(createPolicyStore(app)).resolves.toBe(mockUserDataPolicyStore);
});
