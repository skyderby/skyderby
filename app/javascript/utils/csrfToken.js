const getMetaElement = () => document.querySelector('meta[name=csrf-token]')

export const getCSRFToken = () => {
  const meta = getMetaElement()

  return meta?.content
}

export const setCSRFToken = newToken => {
  const meta = getMetaElement()

  meta.content = newToken
}
