import uuid from "uuid/v4";
import { getStudentId } from "./get-student-id";

jest.mock("uuid/v4");

beforeEach(() => {
  uuid.mockReturnValue("123-456-789");
});

test("reads student ID from app.userData", () => {
  const app = {
    userData: {
      read(key, cb) {
        if (key === "studentId") {
          cb({ studentId: "abc123" });
        } else {
          cb(null);
        }
      },
      write(key, data, cb) {
        cb();
      },
    },
  };

  return expect(getStudentId(app)).resolves.toEqual("abc123");
});

test("creates a new UUID and writes it to app.userData if one wasn't returned by read", async () => {
  const app = {
    userData: {
      read(key, cb) {
        cb(null);
      },
      write: jest.fn().mockImplementation((key, data, cb) => {
        cb();
      }),
    },
  };

  await expect(getStudentId(app)).resolves.toEqual("123-456-789");
  expect(app.userData.write).toHaveBeenCalledWith(
    "studentId",
    { studentId: "123-456-789" },
    expect.any(Function)
  );
});
