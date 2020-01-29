export const selectWindData = (state, trackId) => {
  const { byId } = state.tracks.windData

  const data = byId[trackId] || {}

  return data.items || []
}
