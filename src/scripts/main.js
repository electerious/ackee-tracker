import platform from 'platform'

/**
 * Validates options and sets defaults for undefined properties.
 * @param {?Object} opts
 * @returns {Object} opts - Validated options.
 */
const validate = function(opts = {}) {

	// Create new object to avoid changes by reference
	const _opts = {}

	if (opts.ignoreLocalhost !== false) _opts.ignoreLocalhost = true
	else _opts.ignoreLocalhost = false

	if (opts.doNotTrack !== false) _opts.doNotTrack = true
	else _opts.doNotTrack = false

	return _opts

}

/**
 * Determines if a host is a localhost.
 * @param {String} hostname - Hostname that should be tested.
 * @returns {Boolean} isLocalhost
 */
const isLocalhost = function(hostname) {

	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'

}

/**
 * Determines if DNT is enabled.
 * @returns {Boolean} isDoNotTrackEnabled
 */
const isDoNotTrackEnabled = function() {

	return navigator.doNotTrack === '1'

}

/**
 * Iterates over an object to clean it up.
 * @param {Object} obj - Dirty object with empty strings and values.
 * @returns {Object} obj - Clean object without empty strings and values.
 */
const polish = function(obj) {

	return Object.keys(obj).reduce((acc, key) => {

		let value = obj[key]

		value = typeof value === 'string' ? value.trim() : value
		value = value == null ? null : value
		value = value === '' ? null : value

		acc[key] = value

		return acc

	}, {})

}

/**
 * Gathers all platform-, screen- and user-related information.
 * @returns {Object} attributes
 */
export const attributes = function() {

	return polish({
		siteLocation: window.location.href,
		siteReferrer: document.referrer,
		siteTitle: document.title,
		siteLanguage: (navigator.language || navigator.userLanguage).substr(0, 2),
		screenWidth: screen.width,
		screenHeight: screen.height,
		screenColorDepth: screen.colorDepth,
		deviceName: platform.product,
		deviceManufacturer: platform.manufacturer,
		osName: platform.os.family,
		osVersion: platform.os.version,
		browserName: platform.name,
		browserVersion: platform.version,
		browserWidth: document.documentElement.clientWidth || window.outerWidth,
		browserHeight: document.documentElement.clientHeight || window.outerHeight
	})

}

/**
 * Sends a request to a specified URL.
 * Won't catch all errors as some are already logged by the browser.
 * In this case the callback won't fire.
 * @param {String} method - Type of request.
 * @param {String} url - Server (file) location.
 * @param {?Object} attrs - Attributes that should be transferred to the server.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, json.
 */
const send = function(method, url, attrs, next) {

	const xhr = new XMLHttpRequest()

	const parameters = {
		data: {
			type: 'records',
			attributes: attrs
		}
	}

	xhr.open(method, url)

	xhr.onload = () => {

		if (xhr.status === 200 || xhr.status === 201) {

			let json = null

			try {
				json = JSON.parse(xhr.responseText)
			} catch (e) {
				return next(new Error('Failed to parse response from server'))
			}

			return next(null, json)

		} else {

			return next(new Error('Server returned with an unhandled status'))

		}

	}

	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
	xhr.send(JSON.stringify(parameters))

}

/**
 * Creates a new record on the server and updates the record
 * every x seconds to track the duration of the visit.
 * @param {String} server - URL of the Ackee server.
 * @param {String} userId - Id of the user.
 * @param {String} domainId - Id of the domain.
 * @param {Object} attrs - Attributes that should be transferred to the server.
 * @param {Object} opts
 * @returns {?*}
 */
const record = function(server, userId, domainId, attrs, opts) {

	if (opts.doNotTrack === true && isDoNotTrackEnabled() === true) {
		return console.warn('Ackee ignores you because doNotTrack is enabled')
	}

	if (opts.ignoreLocalhost === true && isLocalhost(location.hostname) === true) {
		return console.warn('Ackee ignores you because you are on localhost')
	}

	// Send initial request to server. This will create a new record.
	send('POST', `${ server }/users/${ userId }/domains/${ domainId }/records`, attrs, (err, json) => {

		if (err != null) return console.error(err)

		// Use the URL from the response of the initial request
		const url = server + json.links.self

		// PATCH the record constantly to track the duration of the visit
		setInterval(() => {

			send('PATCH', url, null, (err) => {

				if (err != null) return console.error(err)

			})

		}, 5000)

	})

}

/**
 * Creats a new instance.
 * @param {Object} server - Server details.
 * @param {?Object} opts
 * @returns {Object} instance
 */
export const create = function({ server, userId, domainId }, opts) {

	// Validate options
	opts = validate(opts)

	// Create a new record on the server and updates the record
	// very x seconds to track the duration of the visit. Try to use
	// the default attributes when no custom attributes defined.
	const _record = (attrs = attributes()) => {

		record(server, userId, domainId, attrs, opts)

	}

	// Assign instance to a variable so the instance can be used
	// elsewhere in the current function
	const instance = {
		record: _record
	}

	return instance

}