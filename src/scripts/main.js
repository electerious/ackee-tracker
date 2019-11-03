import platform from 'platform'

const isBrowser = typeof window !== 'undefined'

/**
 * Validates options and sets defaults for undefined properties.
 * @param {?Object} opts
 * @returns {Object} opts - Validated options.
 */
const validate = function(opts = {}) {

	// Create new object to avoid changes by reference
	const _opts = {}

	// Defaults to true
	_opts.ignoreLocalhost = opts.ignoreLocalhost !== false

	// Defaults to false
	_opts.detailed = opts.detailed === true

	return _opts

}

/**
 * Determines if a host is a localhost.
 * @param {String} hostname - Hostname that should be tested.
 * @returns {Boolean} isLocalhost
 */
const isLocalhost = function(hostname) {

	return hostname === '' || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'

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
 * @param {Boolean} detailed - Include personal data.
 * @returns {Object} attributes - User-related information.
 */
export const attributes = function(detailed = false) {

	const defaultData = {
		siteLocation: window.location.href,
		siteReferrer: document.referrer
	}

	const detailedData = {
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
	}

	return polish({
		...defaultData,
		...(detailed === true ? detailedData : {})
	})

}

/**
 * Construct a URL from the given parameters.
 * @param {String} server - URL to ackee-server. Must not end with a slash.
 * @param {String} domainId - Domain id.
 * @param {?String} recordId - Record id.
 * @returns {String} url
 */
const endpoint = function(server, domainId, recordId) {

	const defined = (_) => _ != null

	const url = [
		server,
		'domains',
		domainId,
		'records',
		recordId
	]

	return url.filter(defined).join('/')

}

/**
 * Sends a request to a specified URL.
 * Won't catch all errors as some are already logged by the browser.
 * In this case the callback won't fire.
 * @param {String} method - Type of request.
 * @param {String} url - Server (file) location.
 * @param {?Object} parameters - Parameters that should be transferred to the server.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, json.
 */
const send = function(method, url, parameters, next) {

	const xhr = new XMLHttpRequest()

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
	xhr.send(parameters == null ? null : JSON.stringify(parameters))

}

/**
 * Creates a new record on the server and updates the record
 * every x seconds to track the duration of the visit.
 * @param {String} server - URL of the Ackee server.
 * @param {String} domainId - Id of the domain.
 * @param {Object} attrs - Attributes that should be transferred to the server.
 * @param {Object} opts
 * @param {Function} active - Indicates if the record should still update.
 * @returns {?*}
 */
const record = function(server, domainId, attrs, opts, active) {

	if (opts.ignoreLocalhost === true && isLocalhost(location.hostname) === true) {
		return console.warn('Ackee ignores you because you are on localhost')
	}

	// Send initial request to server. This will create a new record.
	send('POST', endpoint(server, domainId), attrs, (err, json) => {

		if (err != null) return console.error(err)

		const recordId = json.data.id

		// PATCH the record constantly to track the duration of the visit
		const interval = setInterval(() => {

			if (active() === false) {
				clearInterval(interval)
				return
			}

			send('PATCH', endpoint(server, domainId, recordId), null, (err) => {

				if (err != null) return console.error(err)

			})

		}, 15000)

	})

}

/**
 * Looks for an element with Ackee attributes and executes Ackee with the given attributes.
 * Fails silently.
 */
export const detect = function() {

	const elem = document.querySelector('[data-ackee-domain-id]')

	if (elem == null) return

	const server = elem.getAttribute('data-ackee-server') || ''
	const domainId = elem.getAttribute('data-ackee-domain-id')
	const opts = elem.getAttribute('data-ackee-opts') || '{}'

	create({ server, domainId }, JSON.parse(opts)).record()

}

/**
 * Creates a new instance.
 * @param {Object} server - Server details.
 * @param {?Object} opts
 * @returns {Object} instance
 */
export const create = function({ server, domainId }, opts) {

	let globalExecutionId

	// Validate options
	opts = validate(opts)

	// Create a new record on the server and updates the record
	// very x seconds to track the duration of the visit. Try to use
	// the default attributes when no custom attributes defined.
	const _record = (attrs = attributes(opts.detailed)) => {

		// Stop updating old records when calling the record function
		const localExecutionId = globalExecutionId = Date.now()
		const active = () => localExecutionId === globalExecutionId

		record(server, domainId, attrs, opts, active)

	}

	// Return the instance
	return {
		record: _record
	}

}

// Only run Ackee automatically when executed in a browser environment
if (isBrowser === true) {

	detect()

} else {

	console.warn('Ackee is not executing automatically because you are using it in an environment without a `window` object')

}