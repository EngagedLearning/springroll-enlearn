# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com) and this project adheres to [Semantic Versioning](http://semver.org).

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
