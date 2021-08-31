declare module 'virtual-modules/i18n/translations/*' {
  const resource: { [key: string]: string }
  export = resource
}

declare module 'virtual-modules/i18n/supportedLocales' {
  const resource: string[]
  export = resource
}
