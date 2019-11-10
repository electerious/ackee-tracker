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
- [Related](#related)

## Requirements

ackee-tracker requires a running [Ackee server](https://github.com/electerious/Ackee).

## Installation

We recommend installing ackee-tracker using [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install ackee-tracker
```

```sh
yarn add ackee-tracker
```

It's also possible to load ackee-tracker from your Ackee server. The script is served as `tracker.js`.

```html
<script src="https://example.com/tracker.js"></script>
```

## Usage

### Automatically

The easiest way to send data to your Ackee server is by including the script along with the required attributes. Ackee will now track each page visit automatically.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="https://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></script>
```

It's also possible to customize Ackee using the `data-ackee-opts` attribute.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="https://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0" data-ackee-opts='{ "ignoreLocalhost": true }'></script>
```

### Manually

Include the JS-file at the end of your `body` and start tracking page visits by calling `create` manually.

```html
<script src="dist/ackee-tracker.min.js"></script>

<script>
	ackeeTracker.create({
		server: 'https://example.com',
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
	server: 'https://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
}).record()
```

## API

### .detect()

Looks for an element with Ackee attributes, creates an instance and starts tracking.

The function fails silently when it can't find a suitable element.

Example:

```html
<div hidden data-ackee-server="https://example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></div>
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
	server: 'https://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
})
```

```js
const instance = ackeeTracker.create({
	server: 'https://example.com',
	domainId: 'hd11f820-68a1-11e6-8047-79c0c2d9bce0'
}, {
	ignoreLocalhost: true,
	detailed: false
})
```

Parameters:

- `server` `{Object}` An object that contains details about your [Ackee](https://github.com/electerious/Ackee) installation. The `server` property must not end with a slash.
- `opts` `{?Object}` An object of [options](#options).

Returns:

- `{Object}` The created instance.

### .attributes()

Gathers and returns all platform-, screen- and user-related information.

Examples:

```js
const attributes = ackeeTracker.attributes()
```

```js
const attributes = ackeeTracker.attributes(true)
```

Parameters:

- `detailed` `{Boolean}` Include personal data.

Returns:

- `{Object}` User-related information.

## Instance API

Each ackeeTracker instance is an object with functions you can use to track your visitor.

### .record(attributes)

Creates a new record on the server and updates the record constantly to track the duration of the visit. The update of old records will be canceled when you call this function once again.

Examples:

```js
instance.record()
```

```js
instance.record({
	siteLocation: window.location.href,
	siteReferrer: document.referrer
})
```

Parameters:

- `attributes` `{?Object}` Attributes that should be transferred to the server. Will be `ackeeTracker.attributes()` unless specified otherwise.

## Options

The option-object can include the following properties:

```js
{
	/*
	 * Enable or disable tracking when on localhost.
	 */
	ignoreLocalhost: true,
	/*
	 * Enable or disable tracking of personal data.
	 * We recommend to ask the user for permission before turning this option on.
	 */
	detailed: false
}
```

## Related

- [Ackee](https://github.com/electerious/Ackee) - Self-hosted analytics tool
- [gatsby-plugin-ackee-tracker](https://github.com/Burnsy/gatsby-plugin-ackee-tracker) - Gatsby plugin for Ackee
- [use-ackee](https://github.com/electerious/use-ackee) - Use Ackee in React