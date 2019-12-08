export const getCSRFToken = () => {
  const meta = document.querySelector('meta[name=csrf-token]')

  return meta && meta.content
}
