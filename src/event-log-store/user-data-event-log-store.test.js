import { createUserDataEventLogStore } from "./user-data-event-log-store";

const setup = async () => {
  const userData = {
    read: jest.fn().mockImplementation((key, cb) => {
      cb();
    }),
    write: jest.fn().mockImplementation((key, value, cb) => {
      cb();
    }),
  };

  const testObj = await createUserDataEventLogStore(userData);
  return { testObj, userData };
};

test("initialize reads from user data", async () => {
  const callbacks = {};

  const userData = {
    read: jest.fn().mockImplementation((key, callback) => {
      callbacks[key] = callback;
    }),
    write: jest.fn(),
  };

  const promise = createUserDataEventLogStore(userData);

  const events = [{ id: 1 }, { id: 2 }, { id: 3 }];
  callbacks["enlearnEventLog"](events);
  callbacks["enlearnEventLogNotUploaded"]([]);

  const testObj = await promise;
  expect(testObj.getAllEvents()).resolves.toEqual(events);
});

test("records starts empty", async () => {
  const { testObj } = await setup();
  return expect(testObj.getAllEvents()).resolves.toEqual([]);
});

test("recordEvent adds a record", async () => {
  const { testObj } = await setup();

  const event = { id: 1, type: "a", value: "blah" };
  return testObj
    .recordEvent(event)
    .then(() => expect(testObj.getAllEvents()).resolves.toEqual([event]));
});

test("recordEvent writes records to store", async () => {
  const { testObj, userData } = await setup();

  await testObj.recordEvent({ id: 1 });
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLog",
    [{ id: 1 }],
    expect.any(Function)
  );
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLogNotUploaded",
    [1],
    expect.any(Function)
  );

  await testObj.recordEvent({ id: 2 });
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLog",
    [{ id: 1 }, { id: 2 }],
    expect.any(Function)
  );
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLogNotUploaded",
    [1, 2],
    expect.any(Function)
  );

  await testObj.recordEvent({ id: 3 });
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLog",
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    expect.any(Function)
  );
  expect(userData.write).toHaveBeenCalledWith(
    "enlearnEventLogNotUploaded",
    [1, 2, 3],
    expect.any(Function)
  );
});
