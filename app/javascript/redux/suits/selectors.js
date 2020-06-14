export const selectSuit = (state, suitId) => {
  const { byId } = state.suits

  return byId[suitId]
}

export const createSuitSelector = suitId => state => selectSuit(state, suitId)
