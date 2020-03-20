export const isTrackSelected = (state, trackId) =>
  state.flightProfiles.selectedTracks.includes(trackId)

export const selectedTracksSelector = state => state.flightProfiles.selectedTracks

export const selectedTerrainProfileSelector = state =>
  state.flightProfiles.selectedTerrainProfile
