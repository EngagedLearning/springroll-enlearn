// An in-memory object that implements getItem/setItem that we can use in place
// of localStorage when localStorage is not available.
const createInMemoryStorage = () => {
  const data = {};
  return {
    setItem: (key, value) => {
      data[key] = value;
    },
    getItem: key => {
      if (data.hasOwnProperty(key)) return data[key];
      return null;
    },
  };
};

// Tests if localStorage is available. There are a number of interesting cases
// to consider across browsers. Rather than just checking the property it's
// important to actually test setItem due to some behavior of Safari in previous
// versions.
//
// Reference:
// https://michalzalecki.com/why-using-localStorage-directly-is-a-bad-idea/
const isLocalStorageSupported = () => {
  try {
    const testKey = `enlearn.localStorageSupportTest`;
    window.localStorage.setItem(testKey, "");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (err) {
    return false;
  }
};

// A wrapper around an implementation of Storage to give us a Promise based
// interface and key scoping. The read/write methods are the interface on which
// the Enlearn Client depends.
export const createDataStore = appId => {
  const fullKey = key => `enlearn.${appId}.${key}`;

  const storage = isLocalStorageSupported()
    ? window.localStorage
    : createInMemoryStorage();

  const write = (key, dataString) =>
    new Promise((resolve, reject) => {
      try {
        storage.setItem(fullKey(key), dataString);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

  const read = key =>
    new Promise((resolve, reject) => {
      try {
        const dataString = storage.getItem(fullKey(key));
        resolve(dataString);
      } catch (err) {
        reject(err);
      }
    });

  return {
    write,
    read,
  };
};
