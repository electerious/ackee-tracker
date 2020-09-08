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

	return {
		...defaultData,
		...(detailed === true ? detailedData : {})
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
 * @param {String} query - GraphQL query.
 * @param {?Object} variables - Variables for the GraphQL query.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, json.
 */
const send = function(url, query, variables, next) {

	const xhr = new XMLHttpRequest()

	xhr.open('POST', url)

	xhr.onload = () => {

		if (xhr.status === 200 || xhr.status === 201) {

			let json = null

			try {
				json = JSON.parse(xhr.responseText)
			} catch (e) {
				return next(new Error('Failed to parse response from server'))
			}

			if (json.errors != null) {
				return next(new Error(json.errors[0].message))
			}

			return next(null, json)

		} else {

			return next(new Error('Server returned with an unhandled status'))

		}

	}

	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
	xhr.send(JSON.stringify({ query, variables }))

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

	const url = endpoint(server)

	const createQuery = `
		mutation createRecord($domainId: ID!, $input: CreateRecordInput!) {
			createRecord(domainId: $domainId, input: $input) {
				payload {
					id
				}
			}
		}
	`

	const createVariables = {
		domainId,
		input: attrs
	}

	// Send initial request to server. This will create a new record.
	send(url, createQuery, createVariables, (err, json) => {

		if (err != null) return console.error(err)

		const recordId = json.data.createRecord.payload.id

		// PATCH the record constantly to track the duration of the visit
		const interval = setInterval(() => {

			if (active() === false) {
				clearInterval(interval)
				return
			}

			const updateQuery = `
				mutation updateRecord($id: ID!) {
					updateRecord(id: $id) {
						success
					}
				}
			`

			const updateVariables = {
				id: recordId
			}

			send(url, updateQuery, updateVariables, (err) => {

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

	// Creates a new record on the server and updates the record
	// very x seconds to track the duration of the visit. Tries to use
	// the default attributes when there're no custom attributes defined.
	const _record = (attrs = attributes(opts.detailed)) => {

		// Manually stop updating
		let isStopped = false

		// Automatically stop updating when calling the record function, again
		const localExecutionId = globalExecutionId = Date.now()

		// Helper function that checks if the record should still update
		const active = () => isStopped === false && localExecutionId === globalExecutionId

		// Call this function to stop updating the record
		const stop = () => { isStopped = true }

		record(server, domainId, attrs, opts, active)

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