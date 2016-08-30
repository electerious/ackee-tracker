import platform from 'platform'

/**
 * Validates options and sets defaults for undefined properties.
 * @param {Object} opts
 * @returns {Object} opts - Validated options.
 */
const validate = function(opts = {}) {

	// Convert doNotTrack to boolean as navigator.doNotTrack is '0' or '1'
	if (opts.doNotTrack==='0') opts.doNotTrack = false
	if (opts.doNotTrack==='1') opts.doNotTrack = true

	if (opts.ignoreLocalhost!==false) opts.ignoreLocalhost = true
	if (opts.ignoreLocalhost!==true)  opts.ignoreLocalhost = false

	return opts

}

/**
 * Determines if a host is a localhost.
 * @param {String} hostname - Hostname which should be tested.
 * @returns {Boolean} isLocalhost
 */
const isLocalhost = function(hostname) {

	return (hostname==='localhost' || hostname==='127.0.0.1' || hostname==='::1' ? true : false)

}

/**
 * Gathers all platform-, screen- and user-related information. May include empty strings and undefined values.
 * @returns {Object} attributes
 */
export const attributes = function() {

	return {
		siteLocation       : window.location.href,
		siteReferrer       : document.referrer,
		siteTitle          : document.title,
		siteLanguage       : navigator.language.substr(0, 2),
		screenWidth        : screen.width,
		screenHeight       : screen.height,
		screenColorDepth   : screen.colorDepth,
		deviceName         : platform.product,
		deviceManufacturer : platform.manufacturer,
		osName             : platform.os.family,
		osVersion          : platform.os.version,
		browserName        : platform.name,
		browserVersion     : platform.version,
		browserWidth       : document.documentElement.clientWidth || window.outerWidth,
		browserHeight      : document.documentElement.clientHeight || window.outerHeight
	}

}

/**
 * Sends a request to a specified URL.
 * Won't catch all errors as some are already logged by the browser.
 * In this case the callback won't fire.
 * @param {String} method - Type of request.
 * @param {String} url - Server (file) location.
 * @param {?Object} attrs - Attributes which should be transferred to the server.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, json.
 */
const send = function(method, url, attrs, next) {

	const xhr = new XMLHttpRequest()

	const parameters = {
		data: {
			type       : 'records',
			attributes : attrs
		}
	}

	xhr.open(method, url)

	xhr.onload = () => {

		if (xhr.status===200 || xhr.status===201) {

			let json = null

			try { json = JSON.parse(xhr.responseText) }
			catch (e) { return next(new Error('Failed to parse response from server')) }

			next(null, json)

		} else {

			next(new Error('Server returned with an unhandled status'))

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
 * @param {Object} attrs - Attributes which should be transferred to the server.
 * @param {Object} opts
 */
const record = function(server, userId, domainId, attrs, opts) {

	if (opts.doNotTrack===true) {
		return console.warn('Ackee ignores you because doNotTrack is enabled')
	}

	if (opts.ignoreLocalhost===true && isLocalhost(location.hostname)===true) {
		return console.warn('Ackee ignores you because you are on localhost')
	}

	// Send initial request to server. This will create a new record.
	send('POST', `${ server }/users/${ userId }/domains/${ domainId }/records`, attrs, (err, json) => {

		if (err!=null) {
			throw err
		}

		// Use the URL from the response of the initial request
		const url = server + json.links.self

		// PATCH the record every x seconds to track the duration of the visit
		setInterval(() => {

			send('PATCH', url, null, (err, json) => {

				if (err!=null) {
					throw err
				}

			})

		}, 5000)

	})

}

/**
 * Creats a new instance.
 * @param {Object} server - Server details.
 * @param {Object} opts
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
		record : _record
	}

	return instance

}