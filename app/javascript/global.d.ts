declare module '*.scss' {
  const resource: { [key: string]: string }
  export = resource
}

declare module 'icons/*' {
  const resource: any
  export = resource
}

declare interface Window {
  HB_API_KEY?: string
  ENVIRONMENT_NAME?: string
}

declare type AnyHTMLElement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
