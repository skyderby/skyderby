import { I18n } from 'i18n-js'
import translations from 'translations.json'

const defaultLocale = document.querySelector('meta[name="default-locale"]').content
const userLocale = document.querySelector('meta[name="locale"]').content

const i18n = new I18n()
i18n.store(translations)
i18n.defaultLocale = defaultLocale
i18n.locale = userLocale
i18n.enableFallback = true

export default i18n
