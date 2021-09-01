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

const dateLocales: { [key in ApplicationLocale]: Locale } = {
  en: enUS,
  ru,
  it,
  fr,
  es,
  de
}

type TranslationsDict = {
  [locale in ApplicationLocale]?: Translations
}

type I18nContextType = {
  t: (key: string) => string
  supportedLocales: ApplicationLocale[]
  locale?: ApplicationLocale
  formatDate?: (date: Date, format: string) => string
  changeLocale?: (locale: ApplicationLocale) => void
}

const TranslationsContext = createContext<I18nContextType>({
  t: I18n.t,
  supportedLocales
})

const isSupportedLocale = (key: string): key is ApplicationLocale => {
  return supportedLocales.includes(key as ApplicationLocale)
}

const getInitialLocale = (): ApplicationLocale => {
  const defaultLocale = 'en'

  const chosenLocale = String(Cookie.get('locale'))
  if (isSupportedLocale(chosenLocale)) return chosenLocale

  const browserLocale = window.navigator.language.slice(0, 2).toLowerCase()
  if (isSupportedLocale(browserLocale)) return browserLocale

  return defaultLocale
}

const TranslationsProvider = ({
  children
}: {
  children: React.ReactNode
}): JSX.Element | null => {
  const initialized = useRef(false)
  const [locale, setLocale] = useState<ApplicationLocale>(getInitialLocale)

  const [translations, setTranslations] = useState<TranslationsDict>({})

  const changeLocale = (newLocale: ApplicationLocale) => {
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
    async (newLocale: ApplicationLocale) => {
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

  I18n.translations = Object.assign(I18n.translations, translations[locale])
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
