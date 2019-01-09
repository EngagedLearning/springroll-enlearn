import { validateApp } from "./validate-app";
import { createEnlearnApi } from "./create-enlearn-api";

export const setup = app =>
  validateApp(app)
    .then(createEnlearnApi)
    .then(api => {
      app.enlearn = api;
      return api.startSession();
    });
