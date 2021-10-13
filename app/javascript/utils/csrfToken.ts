function getMetaElement(): HTMLMetaElement | null {
  return document.querySelector('meta[name=csrf-token]')
}

export function getCSRFToken(): string {
  const meta = getMetaElement()

  return meta?.content ?? ''
}

export function setCSRFToken(newToken: string): void {
  const meta = getMetaElement()

  if (meta) meta.content = newToken
}
