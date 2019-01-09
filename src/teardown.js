export const teardown = app => {
  if (app.enlearn) {
    const enlearn = app.enlearn;
    delete app.enlearn;
    return enlearn.endSession();
  }
  return Promise.resolve();
};
