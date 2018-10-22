/**
 * SpringRoll-Enlearn 0.9.1
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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var rngBrowser = createCommonjsModule(function (module) {
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));
if (getRandomValues) {
  var rnds8 = new Uint8Array(16);
  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  var rnds = new Array(16);
  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }
    return rnds;
  };
}
});

var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}
function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return ([bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}
var bytesToUuid_1 = bytesToUuid;

function v4(options, buf, offset) {
  var i = buf && offset || 0;
  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};
  var rnds = options.random || (options.rng || rngBrowser)();
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }
  return buf || bytesToUuid_1(rnds);
}
var v4_1 = v4;

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
        return collection.chain().simplesort("event.sequenceNumber", false).data().map(function (r) {
          return r.event;
        });
      });
    }).then(function () {
      return _this._ca.registerQuery(CA_QUERY_LATEST, function (collection) {
        var results = collection.chain().simplesort("event.sequenceNumber", true).limit(1).data().map(function (r) {
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

function getStudentId(app) {
  return new Promise(function (resolve) {
    app.userData.read("studentId", function (data) {
      if (data && data.studentId) {
        resolve(data.studentId);
      } else {
        data = {
          studentId: v4_1()
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
        var _event$event_data = event.event_data,
            problemId = _event$event_data.problemId,
            appData = _event$event_data.appData;
        return client.recordProblemStart(problemId, appData);
      }
    case 7001:
      {
        var _event$event_data2 = event.event_data,
            _problemId = _event$event_data2.problemId,
            completed = _event$event_data2.completed,
            _appData = _event$event_data2.appData;
        return client.recordProblemEnd(_problemId, completed, _appData);
      }
    case 7002:
      {
        var _event$event_data3 = event.event_data,
            stepId = _event$event_data3.stepId,
            evidence = _event$event_data3.evidence,
            _appData2 = _event$event_data3.appData;
        return client.recordStepEvidence(stepId, evidence, _appData2);
      }
    case 7003:
      {
        var _event$event_data4 = event.event_data,
            _stepId = _event$event_data4.stepId,
            scaffoldId = _event$event_data4.scaffoldId,
            _appData3 = _event$event_data4.appData;
        return client.recordScaffoldShown(_stepId, scaffoldId, _appData3);
      }
    default:
      return Promise.resolve();
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
    return enlearn.createEnlearnApi({
      apiKey: app.options.enlearn.apiKey,
      ecosystem: app.config.enlearnEcosystem,
      policy: app.config.enlearnPolicy,
      logStore: logStore,
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
  }
  return Promise.resolve();
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
