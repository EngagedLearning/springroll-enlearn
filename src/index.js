import { setup } from "./setup";
import { teardown } from "./teardown";

(() => {
  /*
   * Note: Plugin functions cannot be converted to => functions because they
   * rely on 'this' to be bound as the application.
   */

  const ApplicationPlugin = window.include("springroll.ApplicationPlugin");
  const plugin = new ApplicationPlugin();

  plugin.setup = function() {
    const enlearnOptions = {
      apiKey: null,
      apiOverride: null,
      client: null,
      appData: {},
    };
    this.options.add("enlearn", enlearnOptions);
  };

  plugin.preload = function(done) {
    setup(this)
      .then(() => setTimeout(done, 0))
      .catch(err => {
        console.error("Error initializing Enlearn plugin:");
        console.error(err);
      });
  };

  plugin.teardown = function() {
    teardown(this).catch(err => {
      console.error("Error shutting down Enlearn plugin");
      console.error(err);
    });
  };
})();
