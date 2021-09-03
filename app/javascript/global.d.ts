declare module '*.scss' {
  const resource: { [key: string]: string }
  export = resource
}

declare module 'icons/*' {
  const resource: any
  export = resource
}
