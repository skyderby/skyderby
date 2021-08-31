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

const dateLocales: { [key: string]: Locale } = {
  en: enUS,
  ru,
  it,
  fr,
  es,
  de
}

interface TranslationEntry {
  [key: string]: string | TranslationEntry
}

type Translations = {
  [locale: string]: TranslationEntry
}

type TranslationsDict = {
  [locale: string]: Translations
}

type I18nContextType = {
  t: (key: string) => string
  supportedLocales: string[]
  locale?: string
  formatDate?: (date: Date, format: string) => string
  changeLocale?: (locale: string) => void
}

const defaultLocale = 'en'

const TranslationsContext = createContext<I18nContextType>({
  t: I18n.t,
  supportedLocales
})

const getInitialLocale = () => {
  const chosenLocale = Cookie.get('locale')
  if (chosenLocale && supportedLocales.includes(chosenLocale)) return chosenLocale

  const browserLocale = window.navigator.language.slice(0, 2).toLowerCase()
  if (supportedLocales.includes(browserLocale)) return browserLocale

  return defaultLocale
}

const TranslationsProvider = ({
  children
}: {
  children: React.ReactNode
}): JSX.Element | null => {
  const initialized = useRef(false)
  const [locale, setLocale] = useState(getInitialLocale)

  const [translations, setTranslations] = useState<TranslationsDict>({})

  const changeLocale = (newLocale: string) => {
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

  const formatDate = (date: Date, formatString: string): string =>
    format(date, formatString, { locale: dateLocales[locale] })

  return (
    <TranslationsContext.Provider
      value={{ t: I18n.t, locale, formatDate, changeLocale, supportedLocales }}
    >
      {children}
    </TranslationsContext.Provider>
  )
}

const useI18n = () => useContext(TranslationsContext)

export { I18n, useI18n }

export default TranslationsProvider
