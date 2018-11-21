import { createPolicyStore } from "./create-policy-store";
import { createUserDataPolicyStore } from "./user-data-policy-store";

jest.mock("./user-data-policy-store");

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
