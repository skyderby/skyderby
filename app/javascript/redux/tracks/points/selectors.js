export const selectPoints = (state, trackId) => {
  const { byId } = state.tracks.points

  const data = byId[trackId] || {}

  return data.items || []
}

export const createPointsSelector = trackId => state => selectPoints(state, trackId)
