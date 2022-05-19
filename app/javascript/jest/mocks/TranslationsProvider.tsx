import React, { createContext, useContext } from 'react'
import I18n from 'i18n-js'
import yaml from 'js-yaml'
import path from 'path'
import glob from 'glob'
import fs from 'fs'
import merge from 'lodash.merge'

const TranslationsContext = createContext<{ t: typeof I18n.t } | undefined>(undefined)

const localesPath = path.resolve(__dirname, '../../../../config/locales')
const filesList = glob.sync('**/*.yml', { cwd: localesPath })

const translations = filesList.reduce((acc, filename) => {
  const fileContent = yaml.load(fs.readFileSync(path.join(localesPath, filename), 'utf8'))

  return merge(acc, fileContent)
}, {})

const mockTranslationsProvider = ({ children }: { children: React.ReactNode }) => {
  I18n.translations = translations
  I18n.locale = 'en'

  return (
    <TranslationsContext.Provider value={{ t: I18n.t }}>
      {children}
    </TranslationsContext.Provider>
  )
}

// eslint-disable-next-line react-hooks/rules-of-hooks
const mockUseContext = () => useContext(TranslationsContext)

jest.mock('components/TranslationsProvider', () => ({
  __esModule: true,
  default: mockTranslationsProvider,
  useI18n: mockUseContext
}))
