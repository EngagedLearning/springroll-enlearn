/**
 * SpringRoll-Enlearn 0.5.0
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
    this._events = [];
  }
  UserDataEventLogStore.prototype.initialize = function initialize() {
    var _this = this;
    return new Promise(function (resolve) {
      _this._userData.read(UserDataEventLogStore.storeKey, function (data) {
        _this._events = data || [];
        resolve();
      });
    });
  };
  UserDataEventLogStore.prototype.getAllEvents = function getAllEvents() {
    return Promise.resolve(this._events);
  };
  UserDataEventLogStore.prototype.getEventsWithTypes = function getEventsWithTypes(types) {
    return Promise.resolve(this._events.filter(function (r) {
      return types.indexOf(r.type) >= 0;
    }));
  };
  UserDataEventLogStore.prototype.getLatestEvent = function getLatestEvent() {
    return Promise.resolve(this._events.length > 0 ? this._events[this._events.length - 1] : null);
  };
  UserDataEventLogStore.prototype.recordEvent = function recordEvent(event) {
    var _this2 = this;
    this._events.push(event);
    return new Promise(function (resolve) {
      return _this2._userData.write(UserDataEventLogStore.storeKey, _this2._events, resolve);
    });
  };
  return UserDataEventLogStore;
}();
UserDataEventLogStore.storeKey = 'enlearnEventLog';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
function getStudentId(app) {
  return new Promise(function (resolve) {
    app.userData.read('studentId', function (data) {
      if (data && data.studentId) {
        resolve(data.studentId);
      } else {
        data = { studentId: uuid() };
        app.userData.write('studentId', data, function () {
          return resolve(data.studentId);
        });
      }
    });
  });
}
function handleLearningEvent(event, client) {
  switch (event.event_id) {
    case 7000:
      {
        return client.recordProblemStart(event.event_data.problemId, event.event_data.metadata);
      }
    case 7001:
      {
        return client.recordProblemEnd(event.event_data.problemId, event.event_data.completed, event.event_data.metadata);
      }
    case 7002:
      {
        return client.recordStepEvidence(event.event_data.stepId, event.event_data.success, event.event_data.metadata);
      }
    case 7003:
      {
        return client.recordScaffoldShown(event.event_data.stepId, event.event_data.scaffoldId, event.event_data.metadata);
      }
  }
}
function createEnlearn(app) {
  if (!app.options.enlearn) {
    return Promise.reject(new Error('Application must provide `enlearn` option object'));
  }
  if (!app.options.enlearn.apiKey) {
    return Promise.reject(new Error('Application must provide `enlearn.apiKey` option'));
  }
  if (!app.options.enlearn.client) {
    return Promise.reject(new Error('Application must provide `enlearn.client` option'));
  }
  if (!app.config.enlearnEcosystem) {
    return Promise.reject(new Error('Application must provide `enlearnEcosystem` config value'));
  }
  if (!app.config.enlearnPolicy) {
    return Promise.reject(new Error('Application must provide `enlearnPolicy` config value'));
  }
  return Promise.all([createEventLogStore(app), getStudentId(app)]).then(function (values) {
    var logStore = values[0],
        studentId = values[1];
    var enlearn = app.options.enlearn.client;
    var eventLog = new enlearn.EventLog(studentId, logStore);
    var ecosystem = new enlearn.Ecosystem(app.config.enlearnEcosystem);
    var policy = new enlearn.Policy(app.config.enlearnPolicy);
    var client = new enlearn.AdaptiveClient({
      ecosystem: ecosystem,
      policy: policy,
      eventLog: eventLog,
      onBrainpoint: app.trigger.bind(app, 'brainpoint')
    });
    return client.startSession().then(function () {
      app.on('learningEvent', function (event) {
        return handleLearningEvent(event, client);
      });
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
  if (app.enlearn) {
    return app.enlearn.endSession().then(function () {
      delete app.enlearn;
    });
  }
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
