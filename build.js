import { writeFile } from 'node:fs/promises'
import js from 'rosid-handler-js'

const data = await js('src/scripts/main.js', {
  optimize: true,
  browserify: {
    standalone: 'ackee-tracker',
  },
})

await writeFile('dist/ackee-tracker.min.js', data)
