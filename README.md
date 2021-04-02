<div align="center">

<img src="https://s.electerious.com/images/ackee-tracker/icon.png" title="ackee-tracker" alt="ackee-tracker logo" width="128">

# ackee-tracker

[![Donate via PayPal](https://img.shields.io/badge/paypal-donate-009cde.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CYKBESW577YWE)

A script that interacts with the API of [Ackee](https://github.com/electerious/Ackee). Should be included on your site to track data.

<br/>

![Ackee tracker code](https://s.electerious.com/images/ackee-tracker/readme.png)

</div>

## 🚀 Installation

We recommend loading ackee-tracker from your Ackee instance. This ensures that the script is always in sync with your installation. The script is served as `tracker.js` or as [a name of your choice](https://github.com/electerious/Ackee/blob/master/docs/Options.md#tracker).

```html
<script async src="https://ackee.example.com/tracker.js" data-ackee-server="https://ackee.example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></script>
```

It's also possible to install ackee-tracker as a module via [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

```sh
npm install ackee-tracker
```

```sh
yarn add ackee-tracker
```

## 🤗 Usage

| Type                            | Usage                   | Best for                      | Records (Views) | Actions (Events) |
| :------------------------------ | :---------------------- | :---------------------------- | :-------------- | :--------------- |
| [Automatically](#automatically) | Via script tag          | Simple sites                  | ✅              | ⛔️               |
| [Manually](#manually)           | Via script tag and code | Advanced sites                | ✅              | ✅               |
| [Programmatic](#programmatic)   | Via module              | Modern sites with build tools | ✅              | ✅               |

### Automatically

The easiest way to send data to your Ackee server is by including the script along with the required attributes. Ackee will now track each page visit automatically.

This approach is perfect for static sites. It tracks a visit whenever a user visits the site or navigates to a new page. Websites with client-side routing however should consider to use any of the other approaches as this one would only track the initial page.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="https://ackee.example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></script>
```

It's also possible to customize Ackee using the `data-ackee-opts` attribute.

```html
<script async src="dist/ackee-tracker.min.js" data-ackee-server="https://ackee.example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0" data-ackee-opts='{ "ignoreLocalhost": true }'></script>
```

### Manually

Include the JS-file at the end of your `body` and start tracking page visits by calling `create` manually.

This approach is perfect for sites without a build system. It gives you more control than the automatic solution, but still allows you to use ackee-tracker without a package manager or JS bundler.

```html
<script src="dist/ackee-tracker.min.js"></script>

<script>
	ackeeTracker.create('https://ackee.example.com').record('hd11f820-68a1-11e6-8047-79c0c2d9bce0')
</script>
```

### Programmatic

Use ackee-tracker as a module and start tracking page visits by calling `create`.

This approach is perfect if your site uses client-side routing or changes content without reloading the site. It allows you to call Ackee whenever you need.

Example:

```js
const ackeeTracker = require('ackee-tracker')

ackeeTracker.create('https://ackee.example.com').record('hd11f820-68a1-11e6-8047-79c0c2d9bce0')
```

```js
import * as ackeeTracker from 'ackee-tracker'

ackeeTracker.create('https://ackee.example.com').record('hd11f820-68a1-11e6-8047-79c0c2d9bce0')
```

## ⚙️ API

### .detect()

Looks for an element with Ackee attributes, creates an instance and starts tracking.

This function runs automatically in a browser environment and fails silently when it can't find a suitable element. You usually don't need to call this function.

Example:

```html
<div hidden data-ackee-server="https://ackee.example.com" data-ackee-domain-id="hd11f820-68a1-11e6-8047-79c0c2d9bce0"></div>
```

```js
ackeeTracker.detect()
```

### .create(server, opts)

Creates a new ackee-tracker instance.

Be sure to assign your instance to a variable. Tracking a visit or event is only possible with an instance.

Examples:

```js
const instance = ackeeTracker.create('https://ackee.example.com')
```

```js
const instance = ackeeTracker.create('https://ackee.example.com', {
	detailed: false,
	ignoreLocalhost: true
})
```

Parameters:

- `server` `{String}` An URL that points to your [Ackee](https://github.com/electerious/Ackee) installation. The `server` property must not end with a slash.
- `opts` `{?Object}` An object of [options](#-options).

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

## ⚙️ Instance API

Each ackeeTracker instance is an object with functions you can use to track visits and events.

### .record(domainId, attributes, callback)

Creates a new record on the server and updates the record constantly to track the duration of the visit.

Examples:

```js
instance.record('hd11f820-68a1-11e6-8047-79c0c2d9bce0')
```

```js
instance.record('hd11f820-68a1-11e6-8047-79c0c2d9bce0', {
	siteLocation: window.location.href,
	siteReferrer: document.referrer
})
```

```js
instance.record('hd11f820-68a1-11e6-8047-79c0c2d9bce0', undefined, (recordId) => {
	console.log(`Created new record with id '${ recordId }'`)
})
```

```js
const { stop } = instance.record('hd11f820-68a1-11e6-8047-79c0c2d9bce0')

// Manually stop updating the visit duration. The returned function should be used in
// single-page applications. Call the function when the user navigates to a new page
// before creating a new record.
stop()
```

Parameters:

- `domainId` `{String}` Id of the domain.
- `attributes` `{?Object}` Attributes that should be transferred to the server. Will be `ackeeTracker.attributes()` unless specified otherwise.
- `callback` `{?Function}({?String})` Function that executes once the record has been created. Receives the id of the new record.

Returns:

- `{Object}` Object with a `stop` function. Call the returned function to stop updating the visit duration of the created record.

### .updateRecord(recordId)

Updates a record constantly to track the duration of a visit. You usually don't need to call this function, because `.record` calls this function for you. It's however helpful when you want to continue tracking a record after a page reload or after a record has been stopped.

Updating attributes of an existing record isn't possible.

Examples:

```js
instance.updateRecord('dfa929d3-bfbf-43f2-9234-ed646eb68767')
```

```js
const { stop } = instance.updateRecord('dfa929d3-bfbf-43f2-9234-ed646eb68767')

// Manually stop updating the visit duration. The returned function should be used in
// single-page applications. Call the function when the user navigates to a new page
// before creating a new record.
stop()
```

Parameters:

- `recordId` `{String}` Id of the record.

Returns:

- `{Object}` Object with a `stop` function. Call the returned function to stop updating the visit duration.

### .action(eventId, attributes, callback)

Creates a new action on the server to track an event.

Tipps:

- `key` won't show up in the Ackee UI for every event type, but must be specified nevertheless
- Use `1` as `value` to count how many times an event occurred or a price (e.g. `9.99`) to see the sum of successful checkouts in a shop
- Reset an existing `value` using `null` when the user canceled an event (e.g. removed an item from the checkout)

Examples:

```js
instance.action('513a082c-2cd5-4939-b417-72da2fe1761d', {
	key: 'Checkout',
	value: 9.99
})
```

```js
instance.action('1b6e20cb-7c7d-48ca-8cb6-958a55d7a9e3', {
	key: 'Subscription',
	value: 1
}, (actionId) => {
	console.log(`Created new action with id '${ actionId }'`)
})
```

Parameters:

- `eventId` `{String}` Id of the event.
- `attributes` `{Object}` Attributes that should be transferred to the server.
  - `key` `{String}` Key that will be used to group similar actions in the Ackee UI.
  - `value` `{?Number}` Positive float value that is added to all other numerical values of the key.
- `callback` `{?Function}({?String})` Function that executes once the action has been created. Receives the id of the new action.

### .updateAction(actionId, attributes)

Updates an action on the server.

Examples:

```js
instance.updateAction('7fe70f50-cb16-4e27-90ab-d6210296a4b7', {
	key: 'Checkout',
	value: '4.99'
})
```

```js
instance.updateAction('24776c2b-c5d6-4fac-852a-067d086dc4af', {
	key: 'Subscription',
	value: null
})
```

Parameters:

- `actionId` `{String}` Id of the action.
- `attributes` `{Object}` Attributes that should be transferred to the server.
  - `key` `{String}` Key that will be used to group similar actions in the Ackee UI.
  - `value` `{?Number}` Positive float value that is added to all other numerical values of the key.

## 🔧 Options

The option-object can include the following properties:

```js
{
	/*
	 * Enable or disable tracking of personal data.
	 * We recommend to ask the user for permission before turning this option on.
	 */
	detailed: false,
	/*
	 * Enable or disable tracking when on localhost.
	 */
	ignoreLocalhost: true,
	/*
	 * Enable or disable the tracking of your own visits.
	 * This is enabled by default, but should be turned off when using a wildcard Access-Control-Allow-Origin header.
	 * Some browsers strictly block third-party cookies. The option won't have an impact when this is the case.
	 */
	ignoreOwnVisits: true
}
```

## Miscellaneous

### Donate

I am working hard on continuously developing and maintaining Ackee. Please consider making a donation to keep the project going strong and me motivated.

- [Become a GitHub sponsor](https://github.com/sponsors/electerious)
- [Donate via PayPal](https://paypal.me/electerious)
- [Buy me a coffee](https://www.buymeacoffee.com/electerious)

### Links

- [Follow Ackee on Twitter](https://twitter.com/getackee)
- [Vote for Ackee on ProductHunt](https://www.producthunt.com/posts/ackee)