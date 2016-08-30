# ackee-tracker

A script which interacts with the REST API of [ackee-server](https://github.com/electerious/ackee-server). Should be used to feed your server with data from your visitors.

## Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [API](#api)
- [Instance API](#instance-api)

## Requirements

ackee-tracker requires a running [ackee-server](https://github.com/electerious/ackee-server).

## Setup

We recommend to install ackee-tracker using [Bower](https://bower.io) or [npm](https://npmjs.com).

```sh
bower install ackee-tracker
```

```sh
npm install ackee-tracker
```

Include the JS-file at the end of your `body`…

```html
<script src="dist/ackee-tracker.min.js"></script>
```

…or use ackee-tracker as a module:

```js
const ackeeTracker = require('ackee-tracker')
```

## API

### .create(server)

Creates a new ackee-tracker instance.

Be sure to assign your instance to a variable. Tracking a visit by creating a new record is only possible with an instance.

Example:

```js
const instance = ackeeTracker.create({
	server   : 'http://example.com',
	userId   : 'a2d39b90-68a1-11e6-8047-79c0c2d9bce0',
	domainId : 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
})
```

Parameters:

- `server` `{Object}` An object with details about your [ackee-server](https://github.com/electerious/ackee-server) installation. You can obtain the `userId` and `domainId` from the `db.json` created by [ackee-server](https://github.com/electerious/ackee-server). The `server` property must not end with a slash.

Returns:

- `{Object}` The created instance.

### .attributes()

Gathers and returns all platform-, screen- and user-related information. May include empty strings and undefined values.

Example:

```js
const attributes = ackeeTracker.attributes()
```

Returns:

- `{Object}` Platform-, screen- and user-related information.

## Instance API

Each ackeeTracker instance is an object with functions you can use to track your visitor.

### .record()

Creates a new record on the server and updates the record every x seconds to track the duration of the visit.

Examples:

```js
instance.record()
```

```js
instance.record(ackeeTracker.attributes())
```

Parameters:

- `attributes` `{?Object}` Attributes which should be transferred to the server. Will be `ackeeTracker.attributes()` unless specified otherwise.