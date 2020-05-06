export const selectTrack = (state, trackId) => {
  const { byId } = state.tracks

  return byId[trackId]
}

export const createTrackSelector = trackId => state => selectTrack(state, trackId)
