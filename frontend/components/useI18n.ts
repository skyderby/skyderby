import { I18n } from 'i18n-js'
import { cookies, headers } from 'next/headers'
import Negotiator from 'negotiator'
import { match } from '@formatjs/intl-localematcher'

const availableLocales = ['en', 'ru', 'fr', 'it', 'es', 'de']
const defaultLocale = 'en'

export const currentLocale = () => {
  const cookieStore = cookies()
  const headersList = headers()
  const preferredLocale = cookieStore.get('locale')
    ? String(cookieStore.get('locale'))
    : undefined
  const browserLocales = new Negotiator({
    headers: Object.fromEntries(headersList.entries())
  }).languages()

  const requestedLocales = [preferredLocale, ...browserLocales].filter(
    (locale: string | undefined): locale is string => !!locale
  )

  return match(requestedLocales, availableLocales, defaultLocale)
}

const useI18n = (translations: Record<string, string>) => {
  const i18n = new I18n(translations)
  const locale = currentLocale()
  i18n.locale = locale

  const t = i18n.t.bind(i18n)

  return { i18n, locale, t }
}

export default useI18n
