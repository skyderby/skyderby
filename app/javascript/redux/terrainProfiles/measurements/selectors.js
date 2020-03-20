export const createMeasurementsSelector = terrainProfileId => state => {
  const { byId } = state.terrainProfiles.measurements

  const record = byId[terrainProfileId]

  return record?.items || []
}
