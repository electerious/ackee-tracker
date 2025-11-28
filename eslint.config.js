import defaultConfig from '@electerious/eslint-config'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  ...defaultConfig,
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'unicorn/prefer-global-this': 0,
    },
  },
])
