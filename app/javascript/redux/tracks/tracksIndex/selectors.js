export const selectAllTracks = state => {
  const { allIds, byId } = state.tracks.tracksIndex

  return allIds.map(id => byId[id])
}

export const selectPagination = state => {
  const { currentPage: page, totalPages } = state.tracks.tracksIndex

  return { page, totalPages }
}
