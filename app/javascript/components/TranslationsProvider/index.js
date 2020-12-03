import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  createContext
} from 'react'
import I18n from 'i18n-js'
import { format } from 'date-fns'
import { enUS, ru, it, fr, es, de } from 'date-fns/locale'
import Cookie from 'js-cookie'
import supportedLocales from 'virtual-modules/i18n/supportedLocales'
import PropTypes from 'prop-types'

const dateLocales = {
  en: enUS,
  ru,
  it,
  fr,
  es,
  de
}

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
  const initialized = useRef(false)
  const [locale, setLocale] = useState(getInitialLocale)

  const [translations, setTranslations] = useState({})

  const changeLocale = newLocale => {
    if (!supportedLocales.includes(newLocale)) {
      console.warn(
        `Unsupported locale ${newLocale}, supported locales are: ${supportedLocales}`
      )

      return
    }

    Cookie.set('locale', newLocale)
    loadTranslations(newLocale).then(() => setLocale(newLocale))
  }

  const loadTranslations = useCallback(
    async newLocale => {
      if (translations[newLocale]) return

      const records = await import(`virtual-modules/i18n/translations/${newLocale}`)
      setTranslations(translations => ({ ...translations, [newLocale]: records }))
    },
    [translations, setTranslations]
  )

  useEffect(() => {
    if (initialized.current) return

    loadTranslations(locale)

    initialized.current = true
  }, [locale, loadTranslations])

  if (!translations[locale]) return null

  I18n.translations = translations[locale]
  I18n.locale = locale

  const formatDate = (date, formatString) =>
    format(date, formatString, { locale: dateLocales[locale] })

  return (
    <TranslationsContext.Provider
      value={{ t: I18n.t, locale, formatDate, changeLocale, supportedLocales }}
    >
      {children}
    </TranslationsContext.Provider>
  )
}

TranslationsProvider.propTypes = {
  children: PropTypes.element.isRequired
}

const useI18n = () => useContext(TranslationsContext)

export { I18n, useI18n }

export default TranslationsProvider
