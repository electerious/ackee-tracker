import platform from 'platform'

const isBrowser = typeof window !== 'undefined'
const noop = () => {}

/**
 * Validates options and sets defaults for undefined properties.
 *
 * @param {?object} options - User-defined options.
 * @returns {object} options - Validated options.
 */
const validate = function (options = {}) {
  // Create new object to avoid changes by reference
  const _options = {}

  // Defaults to false
  _options.detailed = options.detailed === true

  // Defaults to true
  _options.ignoreLocalhost = options.ignoreLocalhost !== false

  // Defaults to true
  _options.ignoreOwnVisits = options.ignoreOwnVisits !== false

  return _options
}

/**
 * Determines if a host is a localhost.
 *
 * @param {string} hostname - Hostname that should be tested.
 * @returns {boolean} isLocalhost
 */
const isLocalhost = function (hostname) {
  return hostname === '' || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

/**
 * Determines if user agent is a bot. Approach is to get most bots, assuming other bots don't run JS.
 * Source: https://stackoverflow.com/questions/20084513/detect-search-crawlers-via-javascript/20084661
 *
 * @param {string} userAgent - User agent that should be tested.
 * @returns {boolean} isBot
 */
const isBot = function (userAgent) {
  return /bot|crawler|spider|crawling/i.test(userAgent)
}

/**
 * Checks if an id is a fake id. This is the case when Ackee ignores you because of the `ackee_ignore` cookie.
 *
 * @param {string} id - Id that should be tested.
 * @returns {boolean} isFakeId
 */
const isFakeId = function (id) {
  return id === '88888888-8888-8888-8888-888888888888'
}

/**
 * Checks if the website is in background (e.g. user has minimized or switched tabs).
 *
 * @returns {boolean} isInBackground
 */
const isInBackground = function () {
  return document.visibilityState === 'hidden'
}

/**
 * Get the site referrer.
 *
 * @returns {string} siteReferrer
 */
const siteReferrer = function () {
  const siteReferrer = document.referrer

  return siteReferrer === '' ? undefined : siteReferrer
}

/**
 * Get the optional source parameter.
 *
 * @returns {string} source
 */
const source = function () {
  const source = (location.search.split(`source=`)[1] || '').split('&')[0]

  return source === '' ? undefined : source
}

/**
 * Gathers all platform-, screen- and user-related information.
 *
 * @param {boolean} detailed - Include personal data.
 * @returns {object} attributes - User-related information.
 */
export const attributes = function (detailed = false) {
  const defaultData = {
    siteLocation: window.location.href,
    siteReferrer: siteReferrer(),
    source: source(),
  }

  const detailedData = {
    siteLanguage: (navigator.language || navigator.userLanguage).slice(0, 2),
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
    browserHeight: window.outerHeight,
  }

  return {
    ...defaultData,
    ...(detailed === true ? detailedData : {}),
  }
}

/**
 * Creates an object with a query and variables property to create a record on the server.
 *
 * @param {string} domainId - Id of the domain.
 * @param {object} input - Data that should be transferred to the server.
 * @returns {object} Create record body.
 */
const createRecordBody = function (domainId, input) {
  return {
    query: `
			mutation createRecord($domainId: ID!, $input: CreateRecordInput!) {
				createRecord(domainId: $domainId, input: $input) {
					payload {
						id
					}
				}
			}
		`,
    variables: {
      domainId,
      input,
    },
  }
}

/**
 * Creates an object with a query and variables property to update a record on the server.
 *
 * @param {string} recordId - Id of the record.
 * @returns {object} Update record body.
 */
const updateRecordBody = function (recordId) {
  return {
    query: `
			mutation updateRecord($recordId: ID!) {
				updateRecord(id: $recordId) {
					success
				}
			}
		`,
    variables: {
      recordId,
    },
  }
}

/**
 * Creates an object with a query and variables property to create an action on the server.
 *
 * @param {string} eventId - Id of the event.
 * @param {object} input - Data that should be transferred to the server.
 * @returns {object} Create action body.
 */
const createActionBody = function (eventId, input) {
  return {
    query: `
			mutation createAction($eventId: ID!, $input: CreateActionInput!) {
				createAction(eventId: $eventId, input: $input) {
					payload {
						id
					}
				}
			}
		`,
    variables: {
      eventId,
      input,
    },
  }
}

/**
 * Creates an object with a query and variables property to update an action on the server.
 *
 * @param {string} actionId - Id of the action.
 * @param {object} input - Data that should be transferred to the server.
 * @returns {object} Update action body.
 */
const updateActionBody = function (actionId, input) {
  return {
    query: `
			mutation updateAction($actionId: ID!, $input: UpdateActionInput!) {
				updateAction(id: $actionId, input: $input) {
					success
				}
			}
		`,
    variables: {
      actionId,
      input,
    },
  }
}

/**
 * Construct URL to the GraphQL endpoint of Ackee.
 *
 * @param {string} server - URL of the Ackee server.
 * @returns {string} endpoint - URL to the GraphQL endpoint of the Ackee server.
 */
const endpoint = function (server) {
  const hasTrailingSlash = server.slice(-1) === '/'

  return server + (hasTrailingSlash === true ? '' : '/') + 'api'
}

/**
 * Sends a request to a specified URL.
 * Won't catch all errors as some are already logged by the browser.
 * In this case the callback won't fire.
 *
 * @param {string} url - URL to the GraphQL endpoint of the Ackee server.
 * @param {object} body - JSON which will be send to the server.
 * @param {object} options - Instance options.
 * @param {?Function} next - The callback that handles the response. Receives the following properties: json.
 */
const send = function (url, body, options, next) {
  const xhr = new XMLHttpRequest()

  xhr.open('POST', url)

  xhr.addEventListener('load', () => {
    if (xhr.status !== 200) {
      throw new Error('Server returned with an unhandled status')
    }

    let json

    try {
      json = JSON.parse(xhr.responseText)
    } catch {
      throw new Error('Failed to parse response from server')
    }

    if (json.errors != null) {
      throw new Error(json.errors[0].message)
    }

    if (typeof next === 'function') {
      return next(json)
    }
  })

  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.withCredentials = options.ignoreOwnVisits

  xhr.send(JSON.stringify(body))
}

/**
 * Looks for an element with Ackee attributes and executes Ackee with the given attributes.
 * Fails silently.
 */
export const detect = function () {
  const elem = document.querySelector('[data-ackee-domain-id]')

  if (elem == null) return

  const server = elem.dataset.ackeeServer || ''
  const domainId = elem.dataset.ackeeDomainId
  const options = elem.dataset.ackeeOpts || '{}'

  create(server, JSON.parse(options)).record(domainId)
}

/**
 * Creates a new instance.
 *
 * @param {string} server - URL of the Ackee server.
 * @param {?object} options - Instance options.
 * @returns {object} instance
 */
export const create = function (server, options) {
  options = validate(options)
  const url = endpoint(server)

  // Fake instance when Ackee ignores you
  const fakeInstance = {
    record: () => ({ stop: noop }),
    updateRecord: () => ({ stop: noop }),
    action: noop,
    updateAction: noop,
  }

  if (options.ignoreLocalhost === true && isLocalhost(location.hostname) === true) {
    console.warn('Ackee ignores you because you are on localhost')
    return fakeInstance
  }

  if (isBot(navigator.userAgent) === true) {
    console.warn('Ackee ignores you because you are a bot')
    return fakeInstance
  }

  // Creates a new record on the server and updates the record
  // very x seconds to track the duration of the visit. Tries to use
  // the default attributes when there're no custom attributes defined.
  const _record = (domainId, attrs = attributes(options.detailed), next) => {
    // Function to stop updating the record
    let isStopped = false
    const stop = () => {
      isStopped = true
    }

    send(url, createRecordBody(domainId, attrs), options, (json) => {
      const recordId = json.data.createRecord.payload.id

      if (isFakeId(recordId) === true) {
        return console.warn('Ackee ignores you because this is your own site')
      }

      const interval = setInterval(() => {
        if (isStopped === true) {
          clearInterval(interval)
          return
        }

        if (isInBackground() === true) return

        send(url, updateRecordBody(recordId), options)
      }, 15000)

      if (typeof next === 'function') {
        return next(recordId)
      }
    })

    return { stop }
  }

  // Updates a record very x seconds to track the duration of the visit
  const _updateRecord = (recordId) => {
    // Function to stop updating the record
    let isStopped = false
    const stop = () => {
      isStopped = true
    }

    if (isFakeId(recordId) === true) {
      console.warn('Ackee ignores you because this is your own site')
      return { stop }
    }

    const interval = setInterval(() => {
      if (isStopped === true) {
        clearInterval(interval)
        return
      }

      if (isInBackground() === true) return

      send(url, updateRecordBody(recordId), options)
    }, 15000)

    return { stop }
  }

  // Creates a new action on the server
  const _action = (eventId, attrs, next) => {
    send(url, createActionBody(eventId, attrs), options, (json) => {
      const actionId = json.data.createAction.payload.id

      if (isFakeId(actionId) === true) {
        return console.warn('Ackee ignores you because this is your own site')
      }

      if (typeof next === 'function') {
        return next(actionId)
      }
    })
  }

  // Updates an action
  const _updateAction = (actionId, attrs) => {
    if (isFakeId(actionId) === true) {
      return console.warn('Ackee ignores you because this is your own site')
    }

    send(url, updateActionBody(actionId, attrs), options)
  }

  // Return the real instance
  return {
    record: _record,
    updateRecord: _updateRecord,
    action: _action,
    updateAction: _updateAction,
  }
}

// Only run Ackee automatically when executed in a browser environment
if (isBrowser === true) {
  detect()
}
