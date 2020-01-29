export const selectPlace = (state, placeId) => {
  const { byId } = state.places

  return byId[placeId]
}
