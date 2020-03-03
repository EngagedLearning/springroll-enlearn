/**
 * SpringRoll-Enlearn 3.0.0
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

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var error = function error(value) {
    return new Error("Application must provide " + value);
  };
  var validateApp = function validateApp(app) {
    return new Promise(function (resolve, reject) {
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
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var rngBrowser = createCommonjsModule(function (module) {
    var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
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
    return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
  }
  var bytesToUuid_1 = bytesToUuid;

  function v4(options, buf, offset) {
    var i = buf && offset || 0;
    if (typeof options == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};
    var rnds = options.random || (options.rng || rngBrowser)();
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;
    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }
    return buf || bytesToUuid_1(rnds);
  }
  var v4_1 = v4;

  var createNewId = function createNewId(dataStore) {
    var id = v4_1();
    return dataStore.write("studentId", id).then(function () {
      return id;
    }, function () {
      return id;
    });
  };
  var getStudentId = function getStudentId(dataStore) {
    return dataStore.read("studentId").then(function (id) {
      return id || createNewId(dataStore);
    }).catch(function () {
      return createNewId(dataStore);
    });
  };

  var createInMemoryStorage = function createInMemoryStorage() {
    var data = {};
    return {
      getItem: function getItem(key) {
        var value = data[key];
        return value === undefined ? null : value;
      },
      setItem: function setItem(key, value) {
        data[key] = value.toString();
      },
      removeItem: function removeItem(key) {
        delete data[key];
      },
      clear: function clear() {
        Object.keys(data).forEach(function (k) {
          delete data[k];
        });
      }
    };
  };

  var canUseStorage = function canUseStorage(storage) {
    if (!storage) {
      return false;
    }
    try {
      var testKey = "enlearn_warehouse_storage_support_test_key";
      storage.setItem(testKey, "");
      storage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  };

  var createScopedStorage = function createScopedStorage(_ref) {
    var storage = _ref.storage,
        scope = _ref.scope;
    var fullKey = function fullKey(key) {
      return scope + "." + key;
    };
    return {
      getItem: function getItem(key) {
        return storage.getItem(fullKey(key));
      },
      setItem: function setItem(key, value) {
        return storage.setItem(fullKey(key), value);
      },
      removeItem: function removeItem(key) {
        return storage.removeItem(fullKey(key));
      },
      clear: function clear() {
        return storage.clear();
      }
    };
  };

  var getOrCreateStorage = function getOrCreateStorage() {
    if (canUseStorage(window.localStorage)) {
      return window.localStorage;
    } else if (canUseStorage(window.sessionStorage)) {
      return window.sessionStorage;
    } else {
      return new createInMemoryStorage();
    }
  };
  var createWarehouse = function createWarehouse(_ref) {
    var scope = _ref.scope;
    var storage = createScopedStorage({
      storage: getOrCreateStorage(),
      scope: scope
    });
    return {
      write: function write(key, value) {
        return new Promise(function (resolve, reject) {
          try {
            storage.setItem(key, value);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      },
      read: function read(key) {
        return new Promise(function (resolve, reject) {
          try {
            resolve(storage.getItem(key));
          } catch (err) {
            reject(err);
          }
        });
      },
      remove: function remove(key) {
        return new Promise(function (resolve, reject) {
          try {
            storage.removeItem(key);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      },
      clear: function clear() {
        return new Promise(function (resolve, reject) {
          try {
            storage.clear();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      }
    };
  };

  var createEnlearnApi = function createEnlearnApi(app) {
    var _app$options$enlearn = app.options.enlearn,
        apiKey = _app$options$enlearn.apiKey,
        appId = _app$options$enlearn.appId,
        apiOverride = _app$options$enlearn.apiOverride,
        client = _app$options$enlearn.client,
        appData = _app$options$enlearn.appData;
    var warehouse = createWarehouse({
      scope: "enlearn." + appId
    });
    return getStudentId(warehouse).then(function (studentId) {
      return client.createEnlearnApi({
        apiKey: apiKey,
        appId: appId,
        apiOverride: apiOverride,
        appData: appData,
        ecosystem: app.config.enlearnEcosystem,
        policy: app.config.enlearnPolicy,
        studentId: studentId,
        warehouse: warehouse,
        disableApi: true
      });
    });
  };

  var setup = function setup(app) {
    return validateApp(app).then(createEnlearnApi).then(function (api) {
      app.enlearn = api;
      return api.startSession();
    });
  };

  var teardown = function teardown(app) {
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
        client: null,
        appData: {}
      };
      this.options.add("enlearn", enlearnOptions);
    };
    plugin.preload = function (done) {
      setup(this).then(function () {
        return setTimeout(done, 0);
      }).catch(function (err) {
        console.error("Error initializing Enlearn plugin:");
        console.error(err);
      });
    };
    plugin.teardown = function () {
      teardown(this).catch(function (err) {
        console.error("Error shutting down Enlearn plugin");
        console.error(err);
      });
    };
  })();

}));
