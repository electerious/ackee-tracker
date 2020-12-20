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

	// Defaults to false
	_opts.detailed = opts.detailed === true

	// Defaults to true
	_opts.ignoreLocalhost = opts.ignoreLocalhost !== false

	// Defaults to false
	_opts.ignoreOwnVisits = opts.ignoreOwnVisits === true

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
 * Determines if user agent is a bot. Approach is to get most bots, assuming other bots don't run JS.
 * Source: https://stackoverflow.com/questions/20084513/detect-search-crawlers-via-javascript/20084661
 * @param {String} userAgent - User agent that should be tested.
 * @returns {Boolean} isBot
 */
const isBot = function(userAgent) {

	return (/bot|crawler|spider|crawling/i).test(userAgent)

}

/**
 * Check if record id is a fake id. This is the case when Ackee ignores you because of the `ackee_ignore` cookie.
 * @param {String} recordId - Record id that should be tested.
 * @returns {Boolean} isFakeRecordId
 */
const isFakeRecordId = function(recordId) {

	return recordId === '88888888-8888-8888-8888-888888888888'

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
		browserWidth: window.outerWidth,
		browserHeight: window.outerHeight
	}

	return {
		...defaultData,
		...(detailed === true ? detailedData : {})
	}

}

/**
 * Creates an object with a query and variables property to create a record on the server.
 * @param {String} domainId - Id of the domain.
 * @param {Object} attrs - Attributes that should be transferred to the server.
 * @returns {Object} Create record body.
 */
const createRecordBody = function(domainId, attrs) {

	const query = `
		mutation createRecord($domainId: ID!, $input: CreateRecordInput!) {
			createRecord(domainId: $domainId, input: $input) {
				payload {
					id
				}
			}
		}
	`

	const variables = {
		domainId,
		input: attrs
	}

	return {
		query,
		variables
	}

}

/**
 * Creates an object with a query and variables property to update a record on the server.
 * @param {String} recordId - Id of the record.
 * @returns {Object} Update record body.
 */
const updateRecordBody = function(recordId) {

	const query = `
		mutation updateRecord($id: ID!) {
			updateRecord(id: $id) {
				success
			}
		}
	`

	const variables = {
		id: recordId
	}

	return {
		query,
		variables
	}

}

/**
 * Construct URL to the GraphQL endpoint of Ackee.
 * @param {String} server - URL of the Ackee server.
 * @returns {String} endpoint - URL to the GraphQL endpoint of the Ackee server.
 */
const endpoint = function(server) {

	const hasTrailingSlash = server.substr(-1) === '/'

	return server + (hasTrailingSlash === true ? '' : '/') + 'api'

}

/**
 * Sends a request to a specified URL.
 * Won't catch all errors as some are already logged by the browser.
 * In this case the callback won't fire.
 * @param {String} url - URL to the GraphQL endpoint of the Ackee server.
 * @param {Object} body - JSON which will be send to the server.
 * @param {?Object} opts
 * @param {Function} next - The callback that handles the response. Receives the following properties: json.
 */
const send = function(url, body, opts, next) {

	const xhr = new XMLHttpRequest()

	xhr.open('POST', url)

	xhr.onload = () => {

		if (xhr.status === 200 || xhr.status === 201) {

			let json = null

			try {
				json = JSON.parse(xhr.responseText)
			} catch (e) {
				throw new Error('Failed to parse response from server')
			}

			if (json.errors != null) {
				throw new Error(json.errors[0].message)
			}

			return next(json)

		} else {

			throw new Error('Server returned with an unhandled status')

		}

	}

	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')

	if (opts.ignoreOwnVisits) xhr.withCredentials = true

	xhr.send(JSON.stringify(body))

}

/**
 * Creates a new record on the server and updates the record
 * every x seconds to track the duration of the visit.
 * @param {String} server - URL of the Ackee server.
 * @param {String} domainId - Id of the domain.
 * @param {Object} attrs - Attributes that should be transferred to the server.
 * @param {Object} opts
 * @param {Function} active - Indicates if the record should still update.
 * @param {Object} callbacks - Objects with callback functions to execute when appropriate.
 * @returns {?*}
 */
const record = function(server, domainId, attrs, opts, active, callbacks = {}) {

	if (opts.ignoreLocalhost === true && isLocalhost(location.hostname) === true) {
		return console.warn('Ackee ignores you because you are on localhost')
	}

	if (isBot(navigator.userAgent) === true) {
		return console.warn('Ackee ignores you because you are a bot')
	}

	const onCreate = callbacks.onCreate || (() => {})
	const onUpdate = callbacks.onUpdate || (() => {})

	const url = endpoint(server)
	const createBody = createRecordBody(domainId, attrs)

	// Send initial request to server. This will create a new record.
	send(url, createBody, opts, (json) => {

		const recordId = json.data.createRecord.payload.id
		const updateBody = updateRecordBody(recordId)

		if (isFakeRecordId(recordId) === true) {
			return console.warn('Ackee ignores you because this is your own site')
		}

		onCreate(recordId)

		// PATCH the record constantly to track the duration of the visit
		const interval = setInterval(() => {

			if (active() === false) {
				clearInterval(interval)
				return
			}

			send(url, updateBody, opts, () => {
				onUpdate(recordId)
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

	// Creates a new record on the server and updates the record
	// very x seconds to track the duration of the visit. Tries to use
	// the default attributes when there're no custom attributes defined.
	const _record = (attrs = attributes(opts.detailed), callbacks) => {

		// Manually stop updating
		let isStopped = false

		// Automatically stop updating when calling the record function, again
		const localExecutionId = globalExecutionId = Date.now()

		// Helper function that checks if the record should still update
		const active = () => isStopped === false && localExecutionId === globalExecutionId

		// Call this function to stop updating the record
		const stop = () => { isStopped = true }

		record(server, domainId, attrs, opts, active, callbacks)

		return {
			stop
		}

	}

	// Return the instance
	return {
		record: _record
	}

}

// Only run Ackee automatically when executed in a browser environment
if (isBrowser === true) {

	detect()

}