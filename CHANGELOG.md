# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com) and this project adheres to [Semantic Versioning](http://semver.org).

## 1.0.0 - 2018-12-03

### Removed

- Removed original test code for handling learning events

## 1.0.0-beta.0 - 2018-11-21

### Added

- Plugins takes new required `appId` option which is assigned by Enlearn.
- Plugin implements policy store to support dynamically downloading new machine learning policies.

## 0.11.0 - 2018-11-13

### Added

- Plugin supports `appData` option which is a set of application specific values that are logged with each event in the Enlearn API. This removes the need to pass constant values to each API call made by the game.

## 0.10.0 - 2018-10-29

### Added

- Plugin supports `apiOverride` option which is passed to `createEnlearnApi` to allow for passing in a different API server. This is primarily for testing and shipping games should have have this value set.
- Event log stores are updated to support Enlearn Client API 0.14.0 which now uploads events to the Enlearn API.

## 0.9.1 - 2018-10-22

### Fixed

- Fixed bug in client analytics event log store that caused events not to be ordered correctly, breaking sequence number recording

## 0.9.0 - 2018-09-16

### Added

- `apiKey` is now passed to `createEnlearnApi`

### Changed

- `onBrainpoint` callback is no longer passed to `createEnlearnApi` because it wasn't used
- Changed expected fields on learning events to match API calls:
  - All: `metadata` → `appData`
  - Step evidence: `success` → `evidence`

## 0.8.0 - 2018-09-10

### Changed

- Client Analytics log store wraps event objects to ensure we don't conflict with LokiJS owned fields

## 0.7.0 - 2018-09-04

### Added

- Apps using client analytics will use that API to store event logs

## 0.6.0 - 2018-08-27

### Changed

- Updated to use Enlearn Client API 0.7.0

## 0.5.0 - 2018-08-13

### Changed

- Updated event log store implementation to support Enlearn Client API 0.6.0

## 0.4.0 - 2018-08-10

### Added

- Forwards Learning Events to the Enlearn Client:
  - Event ID 7000 -> recordProblemStart
  - Event ID 7001 -> recordProblemEnd
  - Event ID 7002 -> recordStepEvidence
  - Event ID 7003 -> recordScaffoldShown

### Changed

- Updated to support Enlearn Client API 0.5.0

## 0.3.0 - 2018-08-09

### Changed

- Plugin setup checks for required options and config values before initializing objects
- Updated to support Enlearn Client API 0.4.0

## 0.2.1 - 2018-08-07

### Added

- Dist files are now committed to the repo on release

## 0.2.0 - 2018-08-07

### Added

- Initial stub plugin
