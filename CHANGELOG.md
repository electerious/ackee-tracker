# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [5.1.0] - 2021-04-02

### Added

- Add `module` field in package.json for bundlers (thanks @mathe42, #32)

### Changed

- Ignore updateRecord request if website is in background (thanks @thecodrr, #30)

## [5.0.1] - 2021-01-24

### Fixed

- Re-added `ignoreOwnVisits` option which is now enabled by default, but can be turned off when using a wildcard `Access-Control-Allow-Origin` header

## [5.0.0] - 2021-01-21

This release introduces support for events along with a few breaking changes to make this feature possible.

### Breaking changes

#### `ignoreOwnVisits` is now enabled by default

> This change is relevant for everyone.

Requires [a new `Access-Control-Allow-Credentials` header](https://github.com/electerious/Ackee/blob/master/docs/CORS%20headers.md#credentials) and a non-wildcard `Access-Control-Allow-Origin` header. Make sure to add this header in your server or reverse proxy configuration. Disable `ignoreOwnVisits` when using a wildcard `Access-Control-Allow-Origin` header.

#### New `.create` syntax

> This change is only relevant for you when using ackee-tracker in the [Manually](README.md#manually) or [Programmatic](README.md#programmatic) way.

`.create` must be called with the server URL instead of an object with the server URL and domain id.

```diff
-ackeeTracker.create({
-	server: '<server>',
-	domainId: '<domainId>'
-})
+ackeeTracker.create('<server>')
```

#### New `.record` syntax

> This change is only relevant for you when using ackee-tracker in the [Manually](README.md#manually) or [Programmatic](README.md#programmatic) way.

`.record` must be called with the domain id.

```diff
-instance.record()
+instance.record('<domainId>')
```

#### Calling `.record` again won't stop running record updates

> This change is only relevant for you when using ackee-tracker in the [Manually](README.md#manually) or [Programmatic](README.md#programmatic) way.

We previously stopped existing record updates when calling `.record`, again. This isn't the case anymore. Please use the returned `stop` function instead.

```diff
-// Second call stops updates of first call
-instance.record('<domainId>')
-instance.record('<domainId>')
+// First call needs to be stopped manually
+const { stop } = instance.record('<domainId>')
+stop()
+instance.record('<domainId>')
```

### Added

- Callback for `.record` (#19)
- `.updateRecord` function to update an existing record (#19)
- `.action` and `.updateAction` function to create and update an action to track events
- Uses source parameter and transfers them to Ackee (thanks @BetaHuhn, #27)

### Changed

- `ignoreOwnVisits` is now enabled by default
- `.create` must be called with the server URL instead of an object with the server URL and domain id
- `.record` must be called with the domain id
- Calling `.record` again won't stop existing record updates. Use the returned `stop` function instead.

## [4.2.0] - 2020-11-15

### New

- Ignore your own visits using the `ignoreOwnVisits` (thanks @yehudab)

## [4.1.0] - 2020-11-03

- Ignore bots (#25, #7, thanks @yehudab)

### Changed

- Recommend to use the script served by your Ackee installation (#23)
- Use `window.outerWidth` and `window.outerHeight` to avoid that the browser triggers a repaint when the script loads (#12)

## [4.0.2] - 2020-09-20

### Changed

- Don't log warning when running server-side (#20)

## [4.0.1] - 2020-09-04

### Changed

- README design

## [4.0.0] - 2020-08-15

### Added

- Support the GraphQL API of Ackee v2

### Changed

- Dropped support for older Ackee versions (< 2.0)
- `.record` now returns an object with a stop-function instead of returning the stop-function directly

## [3.3.0] - 2020-05-26

### Added

- `.record` returns a function that allows you to stop updating records

## [3.2.3] - 2020-03-20

### Changed

- Maintenance

## [3.2.2] - 2019-11-03

### Changed

- The update of old records will be canceled when you call `.record()`

## [3.2.1] - 2019-10-09

### Changed

- Reduce amount of record updates (from 5s to every 15s)

## [3.2.0] - 2019-08-11

### Added

- `detailed` option to opt-in for personal/detailed tracking

### Changed

- Attributes (`.attributes()`) don't include personal data by default

## [3.1.3] - 2019-03-29

### Changed

- Remove `doNotTrack` option as it did not make it past the Candidate Recommendation stage

## [3.1.2] - 2019-03-10

### Fixed

- Fix default option when not providing attribute options

## [3.1.1] - 2019-03-10

### Fixed

- Error when not providing attribute options

## [3.1.0] - 2019-03-10

### New

- README with multiple usage examples
- `detect` looks for an element with Ackee attributes, creates an instance and starts tracking

## [3.0.3] - 2019-03-03

### Fixed

- `null` in PATCH request

## [3.0.2] - 2019-03-03

### Fixed

- Incorrect API data

## [3.0.1] - 2019-03-02

### Changed

- Replace `gulp` and `basicTasks` with custom build process

## [3.0.0] - 2018-08-25

### Added

- Added a changelog
- Compatible with the new Ackee API

### Changed

- Syntax changes
- Polish attributes before sending them