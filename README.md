# ackee-tracker

[![Dependencies](https://david-dm.org/electerious/ackee-tracker.svg)](https://david-dm.org/electerious/ackee-tracker#info=dependencies)

A script that interacts with the REST API of [Ackee](https://github.com/electerious/Ackee). Should be used to feed your server with data from your visitors.

## Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [API](#api)
- [Instance API](#instance-api)
- [Options](#options)

## Requirements

ackee-tracker requires a running [ackee-server](https://github.com/electerious/ackee-server).

## Setup

We recommend installing ackee-tracker using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install ackee-tracker
```

```sh
yarn add ackee-tracker
```

Include the JS-file at the end of your `body`…

```html
<script src="dist/ackee-tracker.min.js"></script>
```

…or use ackee-tracker as a module:

```js
const ackeeTracker = require('ackee-tracker')
```

```js
import * as ackeeTracker from 'ackee-tracker'
```

## API

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
	ignoreLocalhost: false,
	doNotTrack: false
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