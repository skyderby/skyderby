export const selectCountry = (state, countryId) => {
  const { byId } = state.countries

  return byId[countryId]
}
