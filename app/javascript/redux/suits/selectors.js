export const selectSuit = (state, suitId) => {
  const { byId } = state.suits

  return byId[suitId]
}
