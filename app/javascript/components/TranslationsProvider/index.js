import React, { useState, useEffect, useContext, createContext } from 'react'
import I18n from 'i18n-js'
import Cookie from 'js-cookie'
import supportedLocales from 'virtual-modules/i18n/supportedLocales'
import PropTypes from 'prop-types'

const TranslationsContext = createContext()
const defaultLocale = 'en'

const getInitialLocale = () => {
  const chosenLocale = Cookie.get('locale')
  if (supportedLocales.includes(chosenLocale)) return chosenLocale

  const browserLocale = window.navigator.language.slice(0, 2).toLowerCase()
  if (supportedLocales.includes(browserLocale)) return browserLocale

  return defaultLocale
}

const TranslationsProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale)

  const [translations, setTranslations] = useState()

  const changeLocale = newLocale => {
    if (!supportedLocales.includes(newLocale)) {
      console.warn(
        `Unsupported locale ${newLocale}, supported locales are: ${supportedLocales}`
      )

      return
    }

    Cookie.set('locale', newLocale)
    setLocale(newLocale)
  }

  useEffect(() => {
    import(`virtual-modules/i18n/translations/${locale}`).then(setTranslations)
  }, [locale])

  if (!translations) return null

  I18n.translations = translations
  I18n.locale = locale

  return (
    <TranslationsContext.Provider value={{ t: I18n.t, changeLocale }}>
      {children}
    </TranslationsContext.Provider>
  )
}

TranslationsProvider.propTypes = {
  children: PropTypes.element.isRequired
}

export const useI18n = () => useContext(TranslationsContext)

export default TranslationsProvider
