export const selectCountry = (state, countryId) => {
  const { byId } = state.country

  return byId[countryId]
}
