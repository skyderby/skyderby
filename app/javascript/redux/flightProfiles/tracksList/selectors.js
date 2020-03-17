export const selectAllTracks = state => {
  const { allIds, byId } = state.flightProfiles.tracksList

  return allIds.map(id => byId[id])
}

export const selectTrack = (state, id) => {
  const { byId } = state.flightProfiles.tracksList

  return byId[id]
}

export const selectHasMore = state => {
  const { currentPage: page, totalPages } = state.flightProfiles.tracksList

  return page < totalPages
}
