import { createUserDataPolicyStore } from "./user-data-policy-store";

let mockUserData;
let testObj;

beforeEach(async () => {
  mockUserData = {
    read: jest.fn().mockImplementation((key, cb) => {
      cb();
    }),
    write: jest.fn().mockImplementation((key, value, cb) => {
      cb();
    }),
  };

  testObj = await createUserDataPolicyStore(mockUserData);
});

test("writes ecosystem ID and policy to user data", async () => {
  await testObj.savePolicy("eco1", { policyStuff: "cool" });

  expect(mockUserData.write).toHaveBeenCalledWith(
    "enlearnPolicy",
    {
      ecosystemId: "eco1",
      policy: {
        policyStuff: "cool",
      },
    },
    expect.any(Function)
  );
});

test("load reads from same key that was written", async () => {
  await testObj.loadPolicy("some eco");
  expect(mockUserData.read).toHaveBeenCalledWith(
    "enlearnPolicy",
    expect.any(Function)
  );
});

test("load returns null if nothing has been saved", () => {
  return expect(testObj.loadPolicy("some eco")).resolves.toEqual(null);
});

test("load returns null if ecosystem ID doesn't match saved ID", () => {
  mockUserData.read.mockImplementation((key, cb) => {
    cb({ ecosystemId: "different eco", policy: { notTheRightPolicy: true } });
  });

  return expect(testObj.loadPolicy("some eco")).resolves.toEqual(null);
});

test("load returns policy if ecosystem ID matches", () => {
  const ecoId = "my eco id";
  const policy = { thisIsThePolicyYoureLookingFor: true };
  mockUserData.read.mockImplementation((key, cb) => {
    cb({ ecosystemId: ecoId, policy });
  });

  return expect(testObj.loadPolicy(ecoId)).resolves.toEqual(policy);
});
