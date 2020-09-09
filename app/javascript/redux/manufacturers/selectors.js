export const selectManufacturer = (state, id) => {
  const { byId } = state.manufacturers

  return byId[id]
}

export const createManufacturerSelector = id => state => selectManufacturer(state, id)

export const selectAllManufacturers = state => Object.values(state.manufacturers.byId)
