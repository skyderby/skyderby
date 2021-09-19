interface Options {
  onError?: OnErrorEventHandler
  onLoad?: EventListener
}

export function loadScript(src: string, { onError, onLoad }: Options = {}): void {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  if (onLoad) script.onload = onLoad
  if (onError) script.onerror = onError

  document.head.appendChild(script)
}

export function loadStyles(src: string): void {
  const styles = document.createElement('link')
  styles.setAttribute('rel', 'stylesheet')
  styles.setAttribute('type', 'text/css')
  styles.setAttribute('href', src)

  document.head.appendChild(styles)
}
