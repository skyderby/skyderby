function getMetaElement(): HTMLMetaElement | null {
  return document.querySelector('meta[name=csrf-token]')
}

export function getCSRFToken(): string | undefined {
  const meta = getMetaElement()

  return meta?.content
}

export function setCSRFToken(newToken: string) {
  const meta = getMetaElement()

  if (meta) meta.content = newToken
}
