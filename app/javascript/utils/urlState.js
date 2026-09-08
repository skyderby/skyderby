export const readParam = name => new URL(window.location).searchParams.get(name)

export const updateParams = changes => {
  const url = new URL(window.location)

  Object.entries(changes).forEach(([name, value]) => {
    if (value === null || value === undefined || value === false) {
      url.searchParams.delete(name)
    } else {
      url.searchParams.set(name, value)
    }
  })

  history.replaceState({}, '', url)
}
