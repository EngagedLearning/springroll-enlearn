# SpringRoll-Enlearn

A [SpringRoll](http://springroll.io) plugin for the [Enlearn Platform](https://www.enlearn.org).

## Installation

The package is available on NPM as `@enlearn/springroll` and can be installed with NPM or Yarn.

Alternatively you can download files directly from the [dist](dist) folder. If you plan to include a file directly into HTML without preprocessing, you would want the `.umd.js` version.

## Promises

This package uses the ES6 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) type for asynchronous operations. To conserve size in the package, users of the library targetting environments without support for Promises must include a polyfill such as [promise-polyfill](https://www.npmjs.com/package/promise-polyfill).

## Configuration

The plugin requires some configuration in order to function. There are two components: application options and configuration files.

### Application Options

In order to function properly the plugin needs values passed in the application options. The first is your Enlearn Platform API key, which allows the plugin to communicate with the Enlearn Platform servers. The second is a reference to the Enlearn Client API. This is passed to the plugin (rather than retrieved by the plugin) to support a number of build/deployment scenarios and because the Enlearn Client API is not open source and therefore cannot be included in this plugin.

If you have added Enlearn Client API script directly in your HTML, your app options would look like this, using the `window.enlearn` global variable as the client:

```javascript
const app = new Application({
  name: "Test App",
  // ...
  enlearn: {
    apiKey: "your enlearn api key here",
    appId: "your enlearn app id here",
    client: window.enlearn,
  },
});
```

If you're using `require` statements it would look more like this:

```javascript
const app = new Application({
  name: "Test App",
  // ...
  enlearn: {
    apiKey: "your enlearn api key here",
    appId: "your enlearn app id here",
    client: require("@enlearn/client"),
  },
});
```

If you're using `import` then you'd want something like this:

```javascript
import * as enlearnClient from "@enlearn/client";
// ...
const app = new Application({
  name: "Test App",
  // ...
  enlearn: {
    apiKey: "your enlearn api key here",
    appId: "your enlearn app id here",
    client: enlearnClient,
  },
});
```

### Configuration Files

Along with the application options, games must include an `enlearnEcosystem.json` and `enlearnPolicy.json` in their [configuration](https://github.com/SpringRoll/SpringRoll/wiki/Config-System) and set the correct `configPath` setting on their Application. These files are used to configure your game's content and provide the Enlearn Client API with information used to guide adaptivity based on the Enlearn Platform machine learning.

Work with your partners at Enlearn to create these configuration files for your game. Each game will have different files and the formats may change depending on the version of the Enlearn Client API in use, so this document intentionally doesn't include examples of these files.

## Usage

The plugin will take care of creating the necessary objects using the Enlearn Client API and will add an `enlearn` property to the application through which the API can be accessed. For more information on how to interact with the Enlearn Client API, please consult the documentation of the Enlearn Client API.

## Enlearn Platform

This software is available under the [MIT License](LICENSE) but portions of the software rely on the [Enlearn Platform](https://www.enlearn.org). Use of this software requires a partnership with Enlearn. If you would like to partner with Enlearn to provide adaptivity for your educational software, please [contact us](https://www.enlearn.org/contact).

---

The contents of this package were developed under a cooperative agreement #PRU295A150003, from the U.S. Department of Education. However, these contents do not necessarily represent the policy of the Department of Education, and you should not assume endorsement by the Federal Government.
