import { teardown } from "./teardown";

test("invokes endSession on enlearn", async () => {
  const enlearn = {
    endSession: jest.fn().mockReturnValue(Promise.resolve()),
  };
  const app = { enlearn };
  await teardown(app);
  expect(enlearn.endSession).toHaveBeenCalled();
});

test("deletes app.enlearn", async () => {
  const enlearn = {
    endSession: jest.fn().mockReturnValue(Promise.resolve()),
  };
  const app = { enlearn };
  await teardown(app);
  expect(app.enlearn).not.toBeDefined();
});

test("returns promise even if app is not set", () => {
  const app = {};
  expect(teardown(app)).toBeInstanceOf(Promise);
});
