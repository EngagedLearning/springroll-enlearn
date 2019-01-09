const error = value => new Error(`Application must provide ${value}`);

export const validateApp = app =>
  new Promise((resolve, reject) => {
    if (!app.options.enlearn) {
      reject(error("`enlearn` option object"));
    } else if (!app.options.enlearn.apiKey) {
      reject(error("`enlearn.apiKey` option"));
    } else if (!app.options.enlearn.appId) {
      reject(error("`enlearn.appId` option"));
    } else if (!app.options.enlearn.client) {
      reject(error("`enlearn.client` option"));
    } else if (!app.config.enlearnEcosystem) {
      reject(error("`enlearnEcosystem` config value"));
    } else if (!app.config.enlearnPolicy) {
      reject(error("`enlearnPolicy` config value"));
    }
    resolve(app);
  });
