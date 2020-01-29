export const selectTrack = (state, trackId) => {
  const { byId } = state.tracks

  return byId[trackId]
}
