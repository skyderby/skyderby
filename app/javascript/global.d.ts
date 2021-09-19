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
  MAPS_API_KEY?: string
  youtubeApiReady?: boolean
  onYouTubeIframeAPIReady?: () => void
  onYoutubeApiLoadingError?: () => void
  cesiumApiReady?: boolean
}

declare type AnyHTMLElement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
