type ApplicationLocale = 'en' | 'ru' | 'it' | 'fr' | 'es' | 'de'

interface TranslationEntry {
  [key: string]: string | TranslationEntry
}

type Translations = {
  [locale in ApplicationLocale]: TranslationEntry
}

declare module 'virtual-modules/i18n/translations/*' {
  const resource: Translations
  export = resource
}

declare module 'virtual-modules/i18n/supportedLocales' {
  const resource: ApplicationLocale[]
  export = resource
}
