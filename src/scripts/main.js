import platform from 'platform'

/**
 * Returns the Ackee script element.
 * @returns {HTMLElement} elem
 */
const getScriptElem = function() {

	return document.querySelector('script[data-ackee]')

}

/**
 * Returns the URL of the Ackee server.
 * @returns {String} url - URL to the server. Never ends with a slash.
 */
const getServerURL = function() {

	let url = getScriptElem().getAttribute('data-ackee')

	if (url.substr(-1)==='/') url = url.substr(0, url.length - 1)

	return url

}

/**
 * Returns the id of the user.
 * @returns {String} userId
 */
const getUserId = function() {

	return getScriptElem().getAttribute('data-userId')

}

/**
 * Returns the id of the domain.
 * @returns {String} domainId
 */
const getDomainId = function() {

	return getScriptElem().getAttribute('data-domainId')

}

/**
 * Gathers all platform-, screen- and user-related information. May include empty strings and undefined values.
 * @returns {Object} attributes
 */
const getAttributes = function() {

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
 * @param {Object} attributes - Attributes which should be transferred to the server.
 * @param {Function} next - The callback that handles the response. Receives the following properties: err, json.
 */
const send = function(method, url, attributes, next) {

	const xhr = new XMLHttpRequest()

	const parameters = {
		data: {
			type       : 'records',
			attributes : attributes
		}
	}

	xhr.open(method, url)

	xhr.onload = () => {

		if (xhr.status===200) {

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

send('POST', `${ getServerURL() }/users/${ getUserId() }/domains/${ getDomainId() }/records`, getAttributes(), (err, json) => {

	if (err!=null) {
		throw err
	}

	console.log(json)

})