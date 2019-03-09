# ackee-tracker

[![Dependencies](https://david-dm.org/electerious/ackee-tracker.svg)](https://david-dm.org/electerious/ackee-tracker#info=dependencies)

A script that interacts with the REST API of [Ackee](https://github.com/electerious/Ackee). Should be used to feed your server with data from your visitors.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Instance API](#instance-api)
- [Options](#options)

## Requirements

ackee-tracker requires a running [ackee-server](https://github.com/electerious/ackee-server).

## Installation

We recommend installing ackee-tracker using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install ackee-tracker
```

```sh
yarn add ackee-tracker
```

## Usage

### Automatically

The easiest way to send data to your Ackee server is by including the script along with the required attributes. Ackee will now track each page visit automatically.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="http://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></script>
```

It's also possible to customize Ackee using the `data-ackee-opts` attribute.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="http://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0" data-ackee-opts='{ "ignoreLocalhost": true, "doNotTrack": true }'></script>
```

### Manually

Include the JS-file at the end of your `body` and start tracking page visits by calling `create` manually.

```html
<script src="dist/ackee-tracker.min.js"></script>

<script>
	ackeeTracker.create({
		server: 'http://example.com',
		domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
	}).record()
</script>
```

### Programmatic

Use ackee-tracker as a module and start tracking page visits by calling `create`.

Example:

```js
const ackeeTracker = require('ackee-tracker')
```

```js
import * as ackeeTracker from 'ackee-tracker'

ackeeTracker.create({
	server: 'http://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
}).record()
```

## API

### .detect()

Looks for an element with Ackee attributes, creates an instance and starts tracking.

The function fails silently when it can't find a suitable element.

Example:

```html
<div hidden data-ackee-server="http://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></div>
```

```js
ackeeTracker.detect()
```

### .create(server, opts)

Creates a new ackee-tracker instance.

Be sure to assign your instance to a variable. Tracking a visit by creating a new record is only possible with an instance.

Examples:

```js
const instance = ackeeTracker.create({
	server: 'http://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
})
```

```js
const instance = ackeeTracker.create({
	server: 'http://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
}, {
	ignoreLocalhost: true,
	doNotTrack: true
})
```

Parameters:

- `server` `{Object}` An object that contains details about your [ackee-server](https://github.com/electerious/ackee-server) installation. The `server` property must not end with a slash.
- `opts` `{?Object}` An object of [options](#options).

Returns:

- `{Object}` The created instance.

### .attributes()

Gathers and returns all platform-, screen- and user-related information.

Example:

```js
const attributes = ackeeTracker.attributes()
```

Returns:

- `{Object}` Platform-, screen- and user-related information.

## Instance API

Each ackeeTracker instance is an object with functions you can use to track your visitor.

### .record(attributes)

Creates a new record on the server and updates the record constantly to track the duration of the visit.

Examples:

```js
instance.record()
```

```js
instance.record(ackeeTracker.attributes())
```

Parameters:

- `attributes` `{?Object}` Attributes that should be transferred to the server. Will be `ackeeTracker.attributes()` unless specified otherwise.

## Options

The option-object can include the following properties:

```js
{
	/*
	 * Disable tracking when on localhost.
	 */
	ignoreLocalhost: true,
	/*
	 * Respect do-not-track setting of the user.
	 */
	doNotTrack: true
}
```