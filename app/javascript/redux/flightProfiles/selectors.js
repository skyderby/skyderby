export const isTrackSelected = (state, trackId) =>
  state.flightProfiles.selectedTracks.includes(trackId)

export const selectSelectedTracks = state => state.flightProfiles.selectedTracks
