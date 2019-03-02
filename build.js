'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')
const js = require('rosid-handler-js')
const save = promisify(writeFile)

js('src/scripts/main.js', {

	optimize: true,
	browserify: {
		standalone: 'ackee-tracker'
	}

}).then((data) => {

	return save('dist/ackee-tracker.min.js', data)

})