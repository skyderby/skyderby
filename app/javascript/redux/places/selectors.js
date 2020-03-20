export const selectPlace = (state, placeId) => {
  const { byId } = state.places

  return byId[placeId]
}

export const selectPlaces = state => {
  const { allIds, byId } = state.places

  return allIds.map(id => byId[id])
}
