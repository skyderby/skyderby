const path = require('path')
const glob = require('glob')
const fs = require('fs')
const yaml = require('yaml-js')
const merge = require('lodash.merge')

const localesPath = path.resolve(__dirname, '../locales')

const buildModules = () => {
  const filesList = glob.sync('**/*.yml', { cwd: localesPath })

  const translations = filesList.reduce((acc, filename) => {
    const fileContent = yaml.load(fs.readFileSync(path.join(localesPath, filename)))

    return merge(acc, fileContent)
  }, {})

  const locales = Object.keys(translations)
  const fallbackLocale = 'en'

  const translationModules = locales.map(locale => {
    const translationsWithFallback = {
      [locale]: merge({}, translations[fallbackLocale], translations[locale])
    }

    return [
      `node_modules/virtual-modules/i18n/translations/${locale}.js`,
      `module.exports = ${JSON.stringify(translationsWithFallback)}`
    ]
  })

  const supportedLocalesModule = [
    'node_modules/virtual-modules/i18n/supportedLocales.js',
    `module.exports = ${JSON.stringify(locales)}`
  ]

  return [...translationModules, supportedLocalesModule]
}

class TranslationsPlugin {
  constructor(virtualModules) {
    this.virtualModules = virtualModules
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('TranslationsPlugin', this.compileHook)
    compiler.hooks.afterCompile.tap('TranslationsPlugin', this.afterCompileHook)
  }

  compileHook = () => {
    const modules = buildModules()
    modules.forEach(([path, content]) => this.virtualModules.writeModule(path, content))
  }

  afterCompileHook = compilation => {
    compilation.contextDependencies.add(localesPath)
  }
}

module.exports = TranslationsPlugin
