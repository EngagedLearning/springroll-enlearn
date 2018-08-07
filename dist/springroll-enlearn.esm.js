/**
 * SpringRoll-Enlearn 0.2.1
 * https://github.com/engagedlearning/springroll-enlearn
 *
 * Copyright © 2018. The Public Broadcasting Service (PBS).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * The contents of this package were developed under a cooperative agreement
 * #PRU295A150003, from the U.S. Department of Education. However, these contents
 * do not necessarily represent the policy of the Department of Education, and
 * you should not assume endorsement by the Federal Government.
 *
 * This Software was commissioned by and developed for PBS under contract with
 * Enlearn. This Software is intended to connect educational games developed by
 * third parties for PBS to Enlearn's proprietary educational learning software
 * engine (the "Enlearn Software"). The Enlearn Software is not licensed pursuant
 * to the MIT License hereunder or under any other open source software license.
 * Use of the Enlearn Software, with or without this Software, requires a written
 * software agreement with Enlearn. If you would like to partner with Enlearn to
 * provide adaptivity for your educational software to the Enlearn Software,
 * please contact Enlearn: https://www.enlearn.org/contact.
 */

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

function createEventLogStore(app) {
  var store = new UserDataEventLogStore(app.userData);
  return store.initialize().then(function () {
    return store;
  });
}
var UserDataEventLogStore = function () {
  function UserDataEventLogStore(userData) {
    classCallCheck(this, UserDataEventLogStore);
    this._userData = userData;
    this._records = [];
  }
  UserDataEventLogStore.prototype.initialize = function initialize() {
    var _this = this;
    return new Promise(function (resolve) {
      _this._userData.read(UserDataEventLogStore.storeKey, function (data) {
        _this._records = data || [];
        resolve();
      });
    });
  };
  UserDataEventLogStore.prototype.addEventLogRecord = function addEventLogRecord(record) {
    var _this2 = this;
    this._records.push(record);
    return new Promise(function (resolve) {
      return _this2._userData.write(UserDataEventLogStore.storeKey, _this2._records, resolve);
    });
  };
  UserDataEventLogStore.prototype.getEventLogRecords = function getEventLogRecords() {
    return Promise.resolve(this._records);
  };
  return UserDataEventLogStore;
}();
UserDataEventLogStore.storeKey = 'enlearnEventLog';

function createProblemStore(app) {
  var store = new UserDataProblemStore(app.userData);
  return store.initialize().then(function () {
    return store;
  });
}
var UserDataProblemStore = function () {
  function UserDataProblemStore(userData) {
    classCallCheck(this, UserDataProblemStore);
    this._userData = userData;
    this._problems = {};
  }
  UserDataProblemStore.prototype.initialize = function initialize() {
    var _this = this;
    return new Promise(function (resolve) {
      _this._userData.read(UserDataProblemStore.storeKey, function (data) {
        _this._problems = data || {};
        resolve();
      });
    });
  };
  UserDataProblemStore.prototype.getProblem = function getProblem(problemId) {
    return Promise.resolve(this._problems[problemId] || null);
  };
  UserDataProblemStore.prototype.saveProblem = function saveProblem(problem) {
    var _this2 = this;
    this._problems[problem.id] = problem;
    return new Promise(function (resolve) {
      return _this2._userData.write(UserDataProblemStore.storeKey, _this2._problems, resolve);
    });
  };
  return UserDataProblemStore;
}();
UserDataProblemStore.storeKey = 'enlearnProblemStore';

function createEnlearn(app) {
  var enlearn = app.options.enlearn.client;
  var logStorePromise = createEventLogStore(app);
  var problemStorePromise = createProblemStore(app);
  return Promise.all([logStorePromise, problemStorePromise]).then(function (values) {
    var logStore = values[0],
        problemStore = values[1];
    var eventLog = new enlearn.EventLog({
      store: logStore
    });
    var ecosystem = new enlearn.Ecosystem({
      localData: app.config.enlearnEcosystem,
      eventLog: eventLog,
      problemStore: problemStore
    });
    var policy = new enlearn.Policy({
      localData: app.config.enlearnPolicy
    });
    var client = new enlearn.AdaptiveClient({
      ecosystem: ecosystem,
      policy: policy,
      eventLog: eventLog,
      onBrainpoint: app.trigger.bind(app, 'brainpoint')
    });
    return client.startSession().then(function () {
      return client;
    });
  });
}
function setupPlugin(app) {
  return createEnlearn(app).then(function (enlearn) {
    app.enlearn = enlearn;
  });
}
function teardownPlugin(app) {
  return app.enlearn.endSession().then(function () {
    delete app.enlearn;
  });
}

(function () {
  var ApplicationPlugin = window.include('springroll.ApplicationPlugin');
  var plugin = new ApplicationPlugin();
  plugin.setup = function () {
    var enlearnOptions = {
      apiKey: null,
      client: null
    };
    this.options.add('enlearn', enlearnOptions);
  };
  plugin.preload = function (done) {
    return setupPlugin(this).then(done).catch(function (err) {
      console.error('Error initializing Enlearn plugin: ' + err);
    });
  };
  plugin.teardown = function () {
    teardownPlugin(this).catch(function (err) {
      console.error('Error shutting down Enlearn plugin: ' + err);
    });
  };
})();
