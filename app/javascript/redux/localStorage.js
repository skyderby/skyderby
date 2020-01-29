const localStorageKey = 'state'

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(localStorageKey)

    if (serializedState === null) return undefined

    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = state => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(localStorageKey, serializedState)
  } catch (err) {}
}
