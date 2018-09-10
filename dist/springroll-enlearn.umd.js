/**
 * SpringRoll-Enlearn 0.8.0
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

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var UD_STORE_KEY = "enlearnEventLog";
  var UserDataEventLogStore =
  function () {
    function UserDataEventLogStore(userData) {
      this._userData = userData;
      this._events = [];
    }
    var _proto = UserDataEventLogStore.prototype;
    _proto.initialize = function initialize() {
      var _this = this;
      return new Promise(function (resolve) {
        _this._userData.read(UD_STORE_KEY, function (data) {
          _this._events = data || [];
          resolve();
        });
      });
    };
    _proto.getAllEvents = function getAllEvents() {
      return Promise.resolve(this._events.slice());
    };
    _proto.getLatestEvent = function getLatestEvent() {
      return Promise.resolve(this._events.length > 0 ? this._events[this._events.length - 1] : null);
    };
    _proto.recordEvent = function recordEvent(event) {
      var _this2 = this;
      this._events.push(event);
      return new Promise(function (resolve) {
        return _this2._userData.write(UD_STORE_KEY, _this2._events, resolve);
      });
    };
    return UserDataEventLogStore;
  }();

  var CA_COLLECTION = "enlearnEventLog";
  var CA_QUERY_ALL = "getAllEvents";
  var CA_QUERY_LATEST = "getLatestEvent";
  var ClientAnalyticsEventLogStore =
  function () {
    function ClientAnalyticsEventLogStore(clientAnalytics) {
      this._ca = clientAnalytics;
    }
    var _proto = ClientAnalyticsEventLogStore.prototype;
    _proto.initialize = function initialize() {
      var _this = this;
      return this._ca.createCollection(CA_COLLECTION).then(function () {
        return _this._ca.registerQuery(CA_QUERY_ALL, function (collection) {
          return collection.chain().simplesort("recordTime", false).simplesort("sequenceNumber", false).data().map(function (r) {
            return r.event;
          });
        });
      }).then(function () {
        return _this._ca.registerQuery(CA_QUERY_LATEST, function (collection) {
          var results = collection.chain().simplesort("recordTime", true).simplesort("sequenceNumber", true).limit(1).data().map(function (r) {
            return r.event;
          });
          return results.length > 0 ? results[0] : null;
        });
      });
    };
    _proto.getAllEvents = function getAllEvents() {
      return this._ca.query(CA_QUERY_ALL, {}, CA_COLLECTION);
    };
    _proto.getLatestEvent = function getLatestEvent() {
      return this._ca.query(CA_QUERY_LATEST, {}, CA_COLLECTION);
    };
    _proto.recordEvent = function recordEvent(event) {
      return this._ca.insert(CA_COLLECTION, {
        event: event
      });
    };
    return ClientAnalyticsEventLogStore;
  }();

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === "x" ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }
  function getStudentId(app) {
    return new Promise(function (resolve) {
      app.userData.read("studentId", function (data) {
        if (data && data.studentId) {
          resolve(data.studentId);
        } else {
          data = {
            studentId: uuid()
          };
          app.userData.write("studentId", data, function () {
            return resolve(data.studentId);
          });
        }
      });
    });
  }
  function createEventLogStore(app) {
    var store;
    if (app.clientAnalytics) {
      store = new ClientAnalyticsEventLogStore(app.clientAnalytics);
    } else {
      store = new UserDataEventLogStore(app.userData);
    }
    return store.initialize().then(function () {
      return store;
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
      return Promise.reject(new Error("Application must provide `enlearn` option object"));
    }
    if (!app.options.enlearn.apiKey) {
      return Promise.reject(new Error("Application must provide `enlearn.apiKey` option"));
    }
    if (!app.options.enlearn.client) {
      return Promise.reject(new Error("Application must provide `enlearn.client` option"));
    }
    if (!app.config.enlearnEcosystem) {
      return Promise.reject(new Error("Application must provide `enlearnEcosystem` config value"));
    }
    if (!app.config.enlearnPolicy) {
      return Promise.reject(new Error("Application must provide `enlearnPolicy` config value"));
    }
    return Promise.all([createEventLogStore(app), getStudentId(app)]).then(function (values) {
      var logStore = values[0],
          studentId = values[1];
      var enlearn = app.options.enlearn.client;
      var ecosystem = app.config.enlearnEcosystem;
      var policy = app.config.enlearnPolicy;
      var onBrainpoint = app.trigger.bind(app, "brainpoint");
      return enlearn.createEnlearnApi({
        ecosystem: ecosystem,
        policy: policy,
        logStore: logStore,
        onBrainpoint: onBrainpoint,
        studentId: studentId
      });
    });
  }
  function setupPlugin(app) {
    return createEnlearn(app).then(function (api) {
      app.enlearn = api;
      app.on("learningEvent", function (event) {
        return handleLearningEvent(event, api);
      });
      return api.startSession();
    });
  }
  function teardownPlugin(app) {
    if (app.enlearn) {
      var enlearn = app.enlearn;
      delete app.enlearn;
      return enlearn.endSession();
    } else {
      return Promise.resolve();
    }
  }

  (function () {
    var ApplicationPlugin = window.include("springroll.ApplicationPlugin");
    var plugin = new ApplicationPlugin();
    plugin.setup = function () {
      var enlearnOptions = {
        apiKey: null,
        client: null
      };
      this.options.add("enlearn", enlearnOptions);
    };
    plugin.preload = function (done) {
      return setupPlugin(this).then(function () {
        return setTimeout(done, 0);
      }).catch(function (err) {
        console.error("Error initializing Enlearn plugin:");
        console.error(err);
      });
    };
    plugin.teardown = function () {
      teardownPlugin(this).catch(function (err) {
        console.error("Error shutting down Enlearn plugin");
        console.error(err);
      });
    };
  })();

})));
