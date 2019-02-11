import uuid from "uuid/v4";
import { getStudentId } from "./get-student-id";

jest.mock("uuid/v4");

beforeEach(() => {
  uuid.mockReturnValue("generated-student-id");
});

test("reads student ID from data store", () => {
  const dataStore = {
    read: jest.fn().mockReturnValue(Promise.resolve("id-from-data-store")),
  };

  return expect(getStudentId(dataStore)).resolves.toEqual("id-from-data-store");
});

test("creates a new UUID and writes it to data store if data store resolves to null", async () => {
  const dataStore = {
    read: jest.fn().mockReturnValue(Promise.resolve(null)),
    write: jest.fn().mockReturnValue(Promise.resolve()),
  };

  await expect(getStudentId(dataStore)).resolves.toEqual(
    "generated-student-id"
  );
  expect(dataStore.write).toHaveBeenCalledWith(
    "studentId",
    "generated-student-id"
  );
});

test("creates a new UUID and writes it to data store if data store rejects", async () => {
  const dataStore = {
    read: jest
      .fn()
      .mockReturnValue(Promise.reject(new Error("Bad data store"))),
    write: jest.fn().mockReturnValue(Promise.resolve()),
  };

  await expect(getStudentId(dataStore)).resolves.toEqual(
    "generated-student-id"
  );
  expect(dataStore.write).toHaveBeenCalledWith(
    "studentId",
    "generated-student-id"
  );
});
