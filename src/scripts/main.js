import platform from 'platform'

/**
 * Converts an object into query string.
 * Skips empty strings or undefined values.
 * @param {object} obj
 * @returns {string} query
 */
const serialize = function(obj) {

	const query = []

	for (const p in obj) {

		const value = obj[p]

		if (obj.hasOwnProperty(p)===true) continue
		if (value==null || value=='')     continue

		query.push(`${ encodeURIComponent(p) }=${ encodeURIComponent(value) }`)

	}

	return query.join('&')

}

/**
 * Returns the Ackee script element.
 * @returns {HTMLElement} elem
 */
const getScriptElem = function() {

	return document.querySelector('script[data-ackee]')

}

/**
 * Returns the URL of the Ackee server.
 * @returns {string} url - URL to the server. Ends with a slash.
 */
const getServer = function() {

	let attr = getScriptElem().getAttribute('data-ackee')

	if (attr.substr(-1)!=='/') attr += '/'

	return attr

}

/**
 * Returns the id of the user.
 * @returns {string} userId
 */
const getUserId = function() {

	return getScriptElem().getAttribute('data-userId')

}

/**
 * Returns the id of the domain.
 * @returns {string} domainId
 */
const getDomainId = function() {

	return getScriptElem().getAttribute('data-domainId')

}

/**
 * Gathers all platform-, screen- and user-related information. May include empty strings and undefined values.
 * @returns {object} data
 */
const getData = function() {

	return {
		siteLocation       : window.location.href,
		siteReferrer       : document.referrer,
		siteTitle          : document.title,
		siteLanguage       : navigator.language.substr(0, 2),
		screenWidth        : screen.width,
		screenHeight       : screen.height,
		screenColorDepth   : screen.colorDepth,
		devicedeviceName   : platform.product,
		deviceManufacturer : platform.manufacturer,
		osName             : platform.os.family,
		osVersion          : platform.os.version,
		browserName        : platform.name,
		browserVersion     : platform.version,
		browserWidth       : document.documentElement.clientWidth || window.outerWidth,
		browserHeight      : document.documentElement.clientHeight || window.outerHeight
	}

}