'use strict'

const { writeFile } = require('fs').promises
const js = require('rosid-handler-js')

js('src/scripts/main.js', {

	optimize: true,
	browserify: {
		standalone: 'ackee-tracker'
	}

}).then((data) => {

	return writeFile('dist/ackee-tracker.min.js', data)

})