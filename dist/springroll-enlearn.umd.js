/**
 * SpringRoll-Enlearn 0.10.0
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

	var EVENTS_KEY = "enlearnEventLog";
	var NOT_UPLOADED_KEY = "enlearnEventLogNotUploaded";
	var createUserDataEventLogStore = function createUserDataEventLogStore(userData) {
	  var events = [];
	  var notUploadedIds = [];
	  var getAllEvents = function getAllEvents() {
	    return Promise.resolve(events.slice());
	  };
	  var recordEvent = function recordEvent(event) {
	    events.push(event);
	    notUploadedIds.push(event.id);
	    return new Promise(function (resolve) {
	      return userData.write(EVENTS_KEY, events, function () {
	        userData.write(NOT_UPLOADED_KEY, notUploadedIds, resolve);
	      });
	    });
	  };
	  var getEventsToUpload = function getEventsToUpload() {
	    return Promise.resolve(events.filter(function (e) {
	      return notUploadedIds.indexOf(e.id) >= 0;
	    }));
	  };
	  var markEventsAsUploaded = function markEventsAsUploaded(eventIds) {
	    notUploadedIds = notUploadedIds.filter(function (id) {
	      return eventIds.indexOf(id) < 0;
	    });
	    return new Promise(function (resolve) {
	      return userData.write(NOT_UPLOADED_KEY, notUploadedIds, resolve);
	    });
	  };
	  return Promise.all([new Promise(function (resolve) {
	    userData.read(EVENTS_KEY, function (data) {
	      events = data || [];
	      resolve();
	    });
	  }), new Promise(function (resolve) {
	    userData.read(NOT_UPLOADED_KEY, function (data) {
	      notUploadedIds = data || [];
	      resolve();
	    });
	  })]).then(function () {
	    return {
	      getAllEvents: getAllEvents,
	      recordEvent: recordEvent,
	      getEventsToUpload: getEventsToUpload,
	      markEventsAsUploaded: markEventsAsUploaded
	    };
	  });
	};

	var EVENTS_COLLECTION = "enlearnEventLog";
	var QUERY_ALL = "getAllEvents";
	var QUERY_NOT_UPLOADED = "getEventsToUpload";
	var QUERY_MARK_UPLOADED = "markEventsAsUploaded";
	var createClientAnalyticsEventLogStore = function createClientAnalyticsEventLogStore(clientAnalytics) {
	  var getAllEvents = function getAllEvents() {
	    return clientAnalytics.query(QUERY_ALL, {}, EVENTS_COLLECTION);
	  };
	  var recordEvent = function recordEvent(event) {
	    return clientAnalytics.insert(EVENTS_COLLECTION, {
	      event: event,
	      uploaded: false
	    });
	  };
	  var getEventsToUpload = function getEventsToUpload() {
	    return clientAnalytics.query(QUERY_NOT_UPLOADED, {}, EVENTS_COLLECTION);
	  };
	  var markEventsAsUploaded = function markEventsAsUploaded(ids) {
	    return clientAnalytics.query(QUERY_MARK_UPLOADED, {
	      ids: ids
	    }, EVENTS_COLLECTION);
	  };
	  var store = {
	    getAllEvents: getAllEvents,
	    recordEvent: recordEvent,
	    getEventsToUpload: getEventsToUpload,
	    markEventsAsUploaded: markEventsAsUploaded
	  };
	  return clientAnalytics.createCollection(EVENTS_COLLECTION).then(function () {
	    return clientAnalytics.registerQuery(QUERY_ALL, function (collection) {
	      return collection.chain().simplesort("event.sequenceNumber", false).data().map(function (r) {
	        return r.event;
	      });
	    });
	  }).then(function () {
	    return clientAnalytics.registerQuery(QUERY_NOT_UPLOADED, function (collection) {
	      return collection.chain().find({
	        uploaded: {
	          $ne: true
	        }
	      }).limit(50).data().map(function (r) {
	        return r.event;
	      });
	    });
	  }).then(function () {
	    return clientAnalytics.registerQuery(QUERY_MARK_UPLOADED, function (collection, params) {
	      var records = collection.chain().find({
	        uploaded: {
	          $ne: true
	        }
	      }).where(function (r) {
	        return params.ids.indexOf(r.event.id) >= 0;
	      }).data();
	      for (var i = 0; i < records.length; i++) {
	        var r = records[i];
	        r.uploaded = true;
	        collection.update(r);
	      }
	      return null;
	    });
	  }).then(function () {
	    return store;
	  });
	};

	var getStudentId = function getStudentId(app) {
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
	};
	var createEventLogStore = function createEventLogStore(app) {
	  if (app.clientAnalytics) {
	    return createClientAnalyticsEventLogStore(app.clientAnalytics);
	  }
	  return createUserDataEventLogStore(app.userData);
	};
	var handleLearningEvent = function handleLearningEvent(event, client) {
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
	};
	var createEnlearn = function createEnlearn(app) {
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
	    var _app$options$enlearn = app.options.enlearn,
	        apiKey = _app$options$enlearn.apiKey,
	        apiOverride = _app$options$enlearn.apiOverride,
	        client = _app$options$enlearn.client;
	    return client.createEnlearnApi({
	      apiKey: apiKey,
	      apiOverride: apiOverride,
	      ecosystem: app.config.enlearnEcosystem,
	      policy: app.config.enlearnPolicy,
	      logStore: logStore,
	      studentId: studentId
	    });
	  });
	};
	var setupPlugin = function setupPlugin(app) {
	  return createEnlearn(app).then(function (api) {
	    app.enlearn = api;
	    app.on("learningEvent", function (event) {
	      return handleLearningEvent(event, api);
	    });
	    return api.startSession();
	  });
	};
	var teardownPlugin = function teardownPlugin(app) {
	  if (app.enlearn) {
	    var enlearn = app.enlearn;
	    delete app.enlearn;
	    return enlearn.endSession();
	  }
	  return Promise.resolve();
	};

	(function () {
	  var ApplicationPlugin = window.include("springroll.ApplicationPlugin");
	  var plugin = new ApplicationPlugin();
	  plugin.setup = function () {
	    var enlearnOptions = {
	      apiKey: null,
	      apiOverride: null,
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
