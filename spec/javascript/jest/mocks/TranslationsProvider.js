import React, { createContext, useContext } from 'react'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'
import yaml from 'yaml-js'
import path from 'path'
import glob from 'glob'
import fs from 'fs'
import merge from 'lodash.merge'

const TranslationsContext = createContext()

const localesPath = path.resolve(__dirname, '../../../../config/locales')
const filesList = glob.sync('**/*.yml', { cwd: localesPath })

const translations = filesList.reduce((acc, filename) => {
  const fileContent = yaml.load(fs.readFileSync(path.join(localesPath, filename)))

  return merge(acc, fileContent)
}, {})

const mockTranslationsProvider = ({ children }) => {
  I18n.translations = translations
  I18n.locale = 'en'

  return (
    <TranslationsContext.Provider value={{ t: I18n.t }}>
      {children}
    </TranslationsContext.Provider>
  )
}

mockTranslationsProvider.propTypes = {
  children: PropTypes.element.isRequired
}

// eslint-disable-next-line react-hooks/rules-of-hooks
const mockUseContext = () => useContext(TranslationsContext)

jest.mock('components/TranslationsProvider', () => ({
  __esModule: true,
  default: mockTranslationsProvider,
  useI18n: mockUseContext
}))
