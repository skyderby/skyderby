export const selectTrackVideo = (state, trackId) => {
  const { byId } = state.tracks.videos

  return byId[trackId]
}

export const createTrackVideoSelector = trackId => state =>
  selectTrackVideo(state, trackId)
