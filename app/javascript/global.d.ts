declare module '*.scss' {
  const resource: { [key: string]: string }
  export = resource
}

declare module 'icons/*' {
  const resource: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export = resource
}

declare module '*.jpg' {
  const resource: string
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
