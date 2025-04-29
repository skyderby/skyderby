import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import babelEslint from '@babel/eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:prettier/recommended',
      'plugin:react/recommended'
    )
  ),
  {
    plugins: {
      'react-hooks': fixupPluginRules(reactHooks)
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        $: false,
        YT: false,
        Rails: false,
        google: false,
        Cesium: false,
        Turbo: false,
        Highcharts: false,
        gtag: false,
        module: false,
        process: false,
        __dirname: false
      },

      parser: babelEslint,
      ecmaVersion: 2018,
      sourceType: 'module'
    },

    settings: {
      react: {
        version: 'detect'
      }
    },

    rules: {
      'linebreak-style': ['error', 'unix'],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true
        }
      ],

      semi: ['error', 'never'],
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],

      'react/prop-types': 'off'
    }
  }
]
