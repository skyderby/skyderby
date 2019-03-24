export function loadScript(src, { onError, onLoad } = {}) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  script.onerror = onError
  script.onload = onLoad

  const [head] = document.getElementsByTagName('head')
  head.appendChild(script)
}

export function loadStyles(src) {
  const styles = document.createElement('link')
  styles.setAttribute('rel', 'stylesheet')
  styles.setAttribute('type', 'text/css')
  styles.setAttribute('href', src)

  const [head] = document.getElementsByTagName('head')
  head.appendChild(styles)
}
